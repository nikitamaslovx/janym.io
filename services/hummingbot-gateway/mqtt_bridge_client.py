"""
MQTT Bridge Client for Hummingbot containers
Runs inside Hummingbot containers to capture logs and run real Hummingbot process
"""

import json
import os
import time
import subprocess
import sys
import paho.mqtt.client as mqtt
from datetime import datetime
import yaml

# Configuration from environment
BOT_ID = os.getenv('BOT_ID', 'default')
MQTT_BROKER = os.getenv('MQTT_BROKER', 'emqx')
MQTT_PORT = int(os.getenv('MQTT_PORT', '1883'))
MQTT_USERNAME = os.getenv('MQTT_USERNAME', 'admin')
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD', 'public')

class HummingbotMQTTBridge:
    def __init__(self):
        self.client = mqtt.Client(client_id=f'hummingbot_bridge_{BOT_ID}')
        self.client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        self.client.on_connect = self.on_connect
        self.is_connected = False
        self.process = None

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            print(f'MQTT Bridge Client: Connected for bot {BOT_ID}', flush=True)
            self.is_connected = True
            self.publish_status('running')
        else:
            print(f'MQTT Bridge Client: Failed to connect, return code {rc}', flush=True)

    def publish_status(self, status: str):
        if not self.is_connected: return
        self.client.publish(
            f'hbot/{BOT_ID}/status',
            json.dumps({'status': status, 'timestamp': time.time()}),
            qos=1,
            retain=True,
        )

    def publish_log(self, level: str, message: str):
        if not self.is_connected: return
        
        # Strip ANSI escape codes (colors, etc.)
        import re
        ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        clean_message = ansi_escape.sub('', message).strip()
        
        if not clean_message: return

        # Filter out ASCII art and box drawing (Welcome screen noise)
        if any(c in clean_message for c in '█╗╝╚═║╔╝'):
            return
        
        # Filter out shell error messages that we know are harmless (from yes | script)
        if 'Broken pipe' in clean_message and 'yes' in clean_message:
            return
        if '/bin/bash:' in clean_message:
            return

        # Try to parse if message is already JSON
        try:
            if clean_message.startswith('{') and clean_message.endswith('}'):
                data = json.loads(clean_message)
                if isinstance(data, dict):
                    msg = data.get('message', '').strip()
                    if msg:
                        clean_message = msg
                    if 'level' in data:
                        level = data['level'].lower()
        except:
            pass

        if not clean_message or len(clean_message) < 2: return

        log_data = {
            'level': level,
            'message': clean_message,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.client.publish(
            f'hbot/{BOT_ID}/logs/{level}',
            json.dumps(log_data),
            qos=0
        )

    def start_mqtt(self):
        try:
            self.client.connect(MQTT_BROKER, MQTT_PORT, 60)
            self.client.loop_start()
        except Exception as e:
            print(f'MQTT Bridge Client: Failed to connect to broker: {e}', flush=True)

    def generate_config(self):
        """Generate Hummingbot configuration files based on environment variables"""
        print("MQTT Bridge Client: Generating configuration files...", flush=True)
        
        # Helper to get config from ENV
        def get_config(key, default=""):
            return os.getenv(f'CONFIG_{key.upper()}', default)

        # Basic PMM configuration (minimal)
        strategy_config = {
            'template_version': 10,
            'strategy': 'pure_market_making',
            'exchange': get_config('exchange', 'binance'),
            'market': get_config('market', 'BTC-USDT'),
            'bid_spread': float(get_config('bid_spread', '0.1')),
            'ask_spread': float(get_config('ask_spread', '0.1')),
            'order_amount': float(get_config('order_amount', '0.01')),
            'order_refresh_time': 30,
            'max_order_age': 1800,
            'order_refresh_tolerance_pct': 0,
            'filled_order_delay': 10,
            'inventory_skew_enabled': False,
            'inventory_target_base_pct': 50,
            'inventory_range_multiplier': 1,
            'filled_order_replenish_wait_time': 10,
            'enable_order_filled_stop_cancellation': False,
            'order_optimization_enabled': False,
            'ask_order_optimization_depth': 0,
            'bid_order_optimization_depth': 0,
            'add_transaction_costs': False,
            'kill_switch_enabled': False,
            'kill_switch_rate': -100,
            'ping_pong_enabled': False,
            'ping_pong_stop_threshold': 0,
        }

        os.makedirs('/hummingbot/conf', exist_ok=True)
        with open('/hummingbot/conf/conf_strategy.yml', 'w') as f:
            yaml.dump(strategy_config, f)
            
        # Global config (minimal)
        global_config = {
            'instance_id': BOT_ID,
            'log_level': 'INFO',
            'debug_console': False,
            'strategy_report_interval': 900,
            'logger_override_whitelist': ['hummingbot.strategy.pure_market_making'],
        }
        with open('/hummingbot/conf/conf_global.yml', 'w') as f:
            yaml.dump(global_config, f)

        print("MQTT Bridge Client: Configuration generated successfully", flush=True)

    def run_bot(self):
        self.generate_config()
        
        print(f"MQTT Bridge Client: Starting REAL Hummingbot process for {BOT_ID}...", flush=True)
        
        password = "admin"
        os.environ['HUMMINGBOT_PASSPHRASE'] = password
        
        # Use 'script' to provide a pseudo-tty to avoid EOFError
        cmd = ["script", "-q", "-e", "-c", f"/opt/conda/envs/hummingbot/bin/python /home/hummingbot/bin/hummingbot.py --password {password} --strategy pure_market_making --config conf_strategy.yml", "/dev/null"]
        
        try:
            self.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                stdin=subprocess.PIPE,
                text=True,
                bufsize=1,
                cwd="/hummingbot"
            )

            # Thread to send initial Enters to skip "Ok" and "Welcome" screens
            import threading
            def feeder():
                # Wait for bot to initialize
                time.sleep(5)
                # Send 5 Enters with intervals to pass welcome screens
                for i in range(5):
                    if self.process and self.process.poll() is None:
                        try:
                            self.process.stdin.write("\n")
                            self.process.stdin.flush()
                        except:
                            break
                        time.sleep(2)
            
            self.feeder_thread = threading.Thread(target=feeder, daemon=True)
            self.feeder_thread.start()

            for line in self.process.stdout:
                sys.stdout.write(line)
                sys.stdout.flush()
                # Determine log level
                level = 'info'
                line_lower = line.lower()
                if 'error' in line_lower: level = 'error'
                elif 'warning' in line_lower: level = 'warning'
                
                self.publish_log(level, line)

            self.process.wait()
            self.publish_status('stopped')
            print(f"MQTT Bridge Client: Bot process exited with code {self.process.returncode}", flush=True)
        except Exception as e:
            error_msg = f"Failed to start Hummingbot: {e}"
            print(error_msg, flush=True)
            self.publish_log('error', error_msg)
            self.publish_status('failed')

    def stop(self):
        if self.process:
            self.process.terminate()
        self.publish_status('stopped')
        self.client.loop_stop()
        self.client.disconnect()

if __name__ == '__main__':
    bridge = HummingbotMQTTBridge()
    bridge.start_mqtt()
    
    try:
        bridge.run_bot()
    except KeyboardInterrupt:
        bridge.stop()
