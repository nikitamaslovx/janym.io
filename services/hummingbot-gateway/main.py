"""
Hummingbot Gateway Service
Manages Docker containers for Hummingbot instances and bridges MQTT communication
"""

import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from dotenv import load_dotenv

from docker_manager import DockerManager
from mqtt_bridge import MQTTBridge
from pydantic import BaseModel

load_dotenv()

mqtt_bridge: MQTTBridge | None = None
docker_manager: DockerManager | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    global mqtt_bridge, docker_manager

    # Initialize Docker manager
    docker_manager = DockerManager()
    await docker_manager.initialize()

    # Initialize MQTT bridge with current event loop
    loop = asyncio.get_running_loop()
    mqtt_bridge = MQTTBridge(docker_manager, loop)
    await mqtt_bridge.start()

    yield

    # Cleanup
    if mqtt_bridge:
        await mqtt_bridge.stop()
    if docker_manager:
        await docker_manager.cleanup()


app = FastAPI(
    title='Hummingbot Gateway Service',
    description='Gateway service for managing Hummingbot Docker containers',
    version='1.0.0',
    lifespan=lifespan,
)


@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'mqtt_connected': mqtt_bridge.is_connected() if mqtt_bridge else False,
        'docker_available': docker_manager.is_available() if docker_manager else False,
    }


@app.get('/containers')
async def list_containers():
    """List all Hummingbot containers"""
    if not docker_manager:
        return {'error': 'Docker manager not initialized'}
    containers = await docker_manager.list_containers()
    return {'containers': containers}


class BacktestRequest(BaseModel):
    config: dict
    start_date: str
    end_date: str


@app.post('/bots/{bot_id}/backtest')
async def run_bot_backtest(bot_id: str, request: BacktestRequest):
    """Run a backtest for a bot"""
    if not docker_manager:
        return {'error': 'Docker manager not initialized', 'success': False}
    
    try:
        container_id = await docker_manager.run_backtest(
            bot_id, 
            request.config, 
            request.start_date, 
            request.end_date
        )
        return {
            'status': 'started', 
            'container_id': container_id,
            'success': True
        }
    except Exception as e:
        return {
            'error': str(e),
            'success': False
        }


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8000)
