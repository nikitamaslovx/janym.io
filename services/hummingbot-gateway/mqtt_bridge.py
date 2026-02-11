"""
MQTT Bridge for Hummingbot Gateway
Subscribes to commands and publishes metrics/status updates
"""

import json
import os
import asyncio
from typing import Optional

import paho.mqtt.client as mqtt
from pydantic import BaseModel

from docker_manager import DockerManager


class StartCommand(BaseModel):
    log_level: str = 'INFO'
    script: Optional[str] = None
    is_quickstart: bool = True
    config: dict = {}


class StopCommand(BaseModel):
    skip_order_cancellation: bool = False


class MQTTBridge:
    def __init__(self, docker_manager: DockerManager, loop: asyncio.AbstractEventLoop):
        self.docker_manager = docker_manager
        self.loop = loop
        self.client: Optional[mqtt.Client] = None
        self.mqtt_broker = os.getenv('MQTT_BROKER_URL', 'localhost')
        self.mqtt_port = int(os.getenv('MQTT_PORT', '1883'))
        self.mqtt_username = os.getenv('MQTT_USERNAME', 'admin')
        self.mqtt_password = os.getenv('MQTT_PASSWORD', 'public')
        self.is_connected_flag = False

    def on_connect(self, client, userdata, flags, rc):
        """Callback for when the client receives a CONNACK response from the server"""
        if rc == 0:
            self.is_connected_flag = True
            print('MQTT Bridge: Connected to broker', flush=True)
            # Subscribe to command topics
            client.subscribe('hbot/+/start')
            client.subscribe('hbot/+/stop')
            client.subscribe('hbot/+/config/update')
            print('MQTT Bridge: Subscribed to topics: hbot/+/start, hbot/+/stop, hbot/+/config/update', flush=True)
        else:
            print(f'MQTT Bridge: Failed to connect, return code {rc}', flush=True)

    def on_disconnect(self, client, userdata, rc):
        """Callback for when the client disconnects from the server"""
        self.is_connected_flag = False
        print('MQTT Bridge: Disconnected from broker')

    def on_message(self, client, userdata, msg):
        """Callback for when a PUBLISH message is received from the server"""
        print(f'MQTT Bridge: Received message on {msg.topic}: {msg.payload.decode()}', flush=True)
        topic_parts = msg.topic.split('/')
        if len(topic_parts) < 3:
            print(f'MQTT Bridge: Invalid topic structure: {msg.topic}', flush=True)
            return

        bot_id = topic_parts[1]
        command = topic_parts[2]

        try:
            payload = json.loads(msg.payload.decode())
        except json.JSONDecodeError:
            print(f'MQTT Bridge: Invalid JSON in message from {msg.topic}', flush=True)
            return

        # Handle command asynchronously and thread-safely
        asyncio.run_coroutine_threadsafe(self.handle_command(bot_id, command, payload), self.loop)

    async def handle_command(self, bot_id: str, command: str, payload: dict):
        """Handle incoming MQTT commands"""
        print(f'MQTT Bridge: Handling command {command} for bot {bot_id}', flush=True)
        try:
            if command == 'start':
                await self.handle_start(bot_id, payload)
            elif command == 'stop':
                await self.handle_stop(bot_id, payload)
            elif command == 'config':
                await self.handle_config_update(bot_id, payload)
        except Exception as e:
            print(f'MQTT Bridge: Error handling command {command} for bot {bot_id}: {e}', flush=True)

    async def handle_start(self, bot_id: str, payload: dict):
        """Handle start command"""
        try:
            start_cmd = StartCommand(**payload)
            await self.docker_manager.start_bot(bot_id, start_cmd.config)
            self.publish_status(bot_id, 'running')
        except Exception as e:
            print(f'MQTT Bridge: Error starting bot {bot_id}: {e}')
            self.publish_status(bot_id, 'error', {'error': str(e)})

    async def handle_stop(self, bot_id: str, payload: dict):
        """Handle stop command"""
        try:
            stop_cmd = StopCommand(**payload)
            await self.docker_manager.stop_bot(bot_id, stop_cmd.skip_order_cancellation)
            self.publish_status(bot_id, 'stopped')
        except Exception as e:
            print(f'MQTT Bridge: Error stopping bot {bot_id}: {e}')
            self.publish_status(bot_id, 'error', {'error': str(e)})

    async def handle_config_update(self, bot_id: str, payload: dict):
        """Handle config update command"""
        try:
            await self.docker_manager.update_bot_config(bot_id, payload)
            self.publish_status(bot_id, 'running')
        except Exception as e:
            print(f'MQTT Bridge: Error updating config for bot {bot_id}: {e}')

    def publish_status(self, bot_id: str, status: str, metadata: dict = None):
        """Publish bot status update"""
        if not self.client or not self.is_connected_flag:
            return

        message = {'status': status, 'timestamp': asyncio.get_event_loop().time()}
        if metadata:
            message.update(metadata)

        self.client.publish(
            f'hbot/{bot_id}/status',
            json.dumps(message),
            qos=1,
            retain=True,
        )

    def publish_metrics(self, bot_id: str, metrics: dict):
        """Publish bot metrics"""
        if not self.client or not self.is_connected_flag:
            return

        self.client.publish(
            f'hbot/{bot_id}/metrics',
            json.dumps(metrics),
            qos=0,
        )

    def publish_order(self, bot_id: str, order_type: str, order_data: dict):
        """Publish order event"""
        if not self.client or not self.is_connected_flag:
            return

        topic = f'hbot/{bot_id}/orders/{order_type}'
        self.client.publish(topic, json.dumps(order_data), qos=1)

    def publish_log(self, bot_id: str, level: str, message: str, metadata: dict = None):
        """Publish log message"""
        if not self.client or not self.is_connected_flag:
            return

        log_data = {'level': level, 'message': message}
        if metadata:
            log_data['metadata'] = metadata

        topic = f'hbot/{bot_id}/logs/{level}'
        self.client.publish(topic, json.dumps(log_data), qos=0)

    async def start(self):
        """Start MQTT bridge with retry logic"""
        self.client = mqtt.Client(client_id=f'hummingbot_gateway_{os.getpid()}')
        self.client.username_pw_set(self.mqtt_username, self.mqtt_password)
        self.client.on_connect = self.on_connect
        self.client.on_disconnect = self.on_disconnect
        self.client.on_message = self.on_message

        max_retries = 10
        retry_delay = 5
        
        for attempt in range(1, max_retries + 1):
            try:
                print(f'MQTT Bridge: Connection attempt {attempt}/{max_retries} to {self.mqtt_broker}:{self.mqtt_port}', flush=True)
                self.client.connect(self.mqtt_broker, self.mqtt_port, 60)
                self.client.loop_start()
                print('MQTT Bridge: Loop started', flush=True)
                return
            except Exception as e:
                print(f'MQTT Bridge: Connection attempt {attempt} failed: {e}', flush=True)
                if attempt < max_retries:
                    await asyncio.sleep(retry_delay)
                else:
                    print('MQTT Bridge: Max retries reached, failed to start', flush=True)

    async def stop(self):
        """Stop MQTT bridge"""
        if self.client:
            self.client.loop_stop()
            self.client.disconnect()
            print('MQTT Bridge: Stopped')

    def is_connected(self) -> bool:
        """Check if MQTT client is connected"""
        return self.is_connected_flag
