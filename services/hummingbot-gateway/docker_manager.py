"""
Docker Manager for Hummingbot Gateway
Manages Docker containers for Hummingbot bot instances
"""

import os
import asyncio
from typing import Optional, List, Dict

import docker
from docker.models.containers import Container


class DockerManager:
    def __init__(self):
        self.client: Optional[docker.DockerClient] = None
        self.containers: Dict[str, Container] = {}
        self.is_available_flag = False

    async def initialize(self):
        """Initialize Docker client"""
        try:
            # Try Unix socket first (default for Linux)
            self.client = docker.from_env()
            # Explicitly test the connection
            self.client.ping()
            self.is_available_flag = True
            print('Docker Manager: Initialized successfully via from_env()')
        except Exception as e:
            print(f'Docker Manager: from_env() failed, trying explicit socket: {e}', flush=True)
            try:
                self.client = docker.DockerClient(base_url='unix://var/run/docker.sock')
                self.client.ping()
                self.is_available_flag = True
                print('Docker Manager: Initialized successfully via unix://var/run/docker.sock', flush=True)
            except Exception as e2:
                print(f'Docker Manager: Explicit socket failed: {e2}', flush=True)
                self.is_available_flag = False
        
        if self.is_available_flag:
            await self.build_bot_image()

    async def build_bot_image(self):
        """Build the custom Hummingbot image with Janym specific tools"""
        print('Docker Manager: Building custom bot image (janym-hummingbot)...', flush=True)
        try:
            # We use the same directory as the gateway for context
            path = os.path.dirname(os.path.abspath(__file__))
            image, logs = self.client.images.build(
                path=path,
                dockerfile='Dockerfile.hummingbot',
                tag='janym-hummingbot',
                rm=True
            )
            for line in logs:
                if 'stream' in line:
                    print(f"Docker Build: {line['stream'].strip()}", flush=True)
            print('Docker Manager: Custom bot image janym-hummingbot built successfully', flush=True)
        except Exception as e:
            print(f'Docker Manager: Failed to build custom bot image: {e}', flush=True)

    async def start_bot(self, bot_id: str, config: dict):
        """Start a Hummingbot container for a bot"""
        print(f'Docker Manager: Starting bot {bot_id} with config: {config}', flush=True)
        if not self.client:
            raise RuntimeError('Docker client not initialized')

        container_name = f'hummingbot_{bot_id}'
        print(f'Docker Manager: Target container name: {container_name}', flush=True)

        # Check if container already exists
        try:
            existing = self.client.containers.get(container_name)
            if existing.status == 'running':
                print(f'Docker Manager: Container {container_name} already running', flush=True)
                return
            else:
                print(f'Docker Manager: Container {container_name} exists with status {existing.status}. Removing it before recreation...', flush=True)
                existing.remove(force=True)
        except docker.errors.NotFound:
            pass
        except Exception as e:
            print(f'Docker Manager: Warning while checking existing container: {e}', flush=True)

        # Create new container
        try:
            print(f'Docker Manager: Creating new container {container_name} from image janym-hummingbot...', flush=True)
            container = self.client.containers.run(
                'janym-hummingbot',  # Use our custom image
                name=container_name,
                detach=True,
                environment={
                    'BOT_ID': bot_id,
                    'MQTT_BROKER': os.getenv('MQTT_BROKER_URL', 'emqx'),
                    'MQTT_PORT': os.getenv('MQTT_PORT', '1883'),
                    **{f'CONFIG_{k.upper()}': str(v) for k, v in config.items()},
                },
                network_mode='janym-network',
                restart_policy={'Name': 'unless-stopped'},
                mem_limit='2g',
            )
            self.containers[bot_id] = container
            print(f'Docker Manager: Created and started container {container_name} (ID: {container.id})', flush=True)
        except Exception as e:
            print(f'Docker Manager: Error creating container {container_name}: {e}', flush=True)
            raise

    async def run_backtest(self, bot_id: str, config: dict, start_date: str, end_date: str):
        """Run a backtest in a temporary container"""
        print(f'Docker Manager: Running backtest for bot {bot_id} from {start_date} to {end_date}', flush=True)
        if not self.client:
            raise RuntimeError('Docker client not initialized')

        container_name = f'backtest_{bot_id}_{int(asyncio.get_event_loop().time())}'
        
        # Merge backtest params into config for the bridge client
        bt_config = {
            **config,
            'backtest': 'true',
            'backtest_start': start_date,
            'backtest_end': end_date
        }

        try:
            container = self.client.containers.run(
                'janym-hummingbot',
                name=container_name,
                detach=True,
                environment={
                    'BOT_ID': f'BT_{bot_id}',
                    'MQTT_BROKER': os.getenv('MQTT_BROKER_URL', 'emqx'),
                    'MQTT_PORT': os.getenv('MQTT_PORT', '1883'),
                    **{f'CONFIG_{k.upper()}': str(v) for k, v in bt_config.items()},
                },
                network_mode='janym-network',
                remove=True, # Auto-remove after completion
                mem_limit='2g',
            )
            print(f'Docker Manager: Backtest container {container_name} started (ID: {container.id})', flush=True)
            return container.id
        except Exception as e:
            print(f'Docker Manager: Error starting backtest container {container_name}: {e}', flush=True)
            raise

    async def stop_bot(self, bot_id: str, skip_order_cancellation: bool = False):
        """Stop a Hummingbot container"""
        if not self.client:
            raise RuntimeError('Docker client not initialized')

        container_name = f'hummingbot_{bot_id}'

        try:
            container = self.client.containers.get(container_name)
            if container.status == 'running':
                container.stop(timeout=30)
                print(f'Docker Manager: Stopped container {container_name}')
            self.containers.pop(bot_id, None)
        except docker.errors.NotFound:
            print(f'Docker Manager: Container {container_name} not found')
        except Exception as e:
            print(f'Docker Manager: Error stopping container: {e}')
            raise

    async def restart_bot(self, bot_id: str):
        """Restart a Hummingbot container"""
        await self.stop_bot(bot_id)
        await asyncio.sleep(2)
        await self.start_bot(bot_id, {})

    async def update_bot_config(self, bot_id: str, config: dict, skip_restart: bool = False):
        """Update bot configuration. If skip_restart is True, assumes internal bridge handles it."""
        if skip_restart:
            print(f'Docker Manager: Skipping restart for bot {bot_id} as requested (on-the-fly update)', flush=True)
            return
        await self.restart_bot(bot_id)

    async def list_containers(self) -> List[dict]:
        """List all Hummingbot containers"""
        if not self.client:
            return []

        containers = []
        try:
            all_containers = self.client.containers.list(
                all=True,
                filters={'name': 'hummingbot_'},
            )
            for container in all_containers:
                containers.append({
                    'id': container.id,
                    'name': container.name,
                    'status': container.status,
                    'bot_id': container.name.replace('hummingbot_', ''),
                })
        except Exception as e:
            print(f'Docker Manager: Error listing containers: {e}')

        return containers

    async def cleanup(self):
        """Cleanup Docker resources"""
        # Containers are managed individually, no global cleanup needed
        print('Docker Manager: Cleanup completed')

    def is_available(self) -> bool:
        """Check if Docker is available"""
        return self.is_available_flag
