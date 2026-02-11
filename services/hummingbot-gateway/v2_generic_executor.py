import os
import yaml
from hummingbot.strategy.script_strategy_base import ScriptStrategyBase
from hummingbot.smart_components.v2_with_controllers import V2WithControllers
from hummingbot.smart_components.models.executor_actions import ExecutorAction
from hummingbot.client.hummingbot_application import HummingbotApplication

class V2GenericExecutor(ScriptStrategyBase):
    """
    A generic V2 strategy executor that loads controller configurations from a YAML file.
    The YAML file path is expected at /hummingbot/conf/controllers_config.yml.
    """
    
    config_path = "/hummingbot/conf/controllers_config.yml"
    remote_config_path = "/hummingbot/conf/remote_config.yml"
    
    def __init__(self, connectors):
        super().__init__(connectors)
        self.v2_with_controllers = None
        self.last_config_check = 0
        self.last_config_mtime = 0
        self.initialize_v2()

    def initialize_v2(self):
        config_to_load = self.config_path
        if os.path.exists(self.remote_config_path):
            config_to_load = self.remote_config_path
            self.last_config_mtime = os.path.getmtime(self.remote_config_path)

        if not os.path.exists(config_to_load):
            self.logger().error(f"Config file not found at {config_to_load}")
            return

        try:
            with open(config_to_load, "r") as f:
                config = yaml.safe_load(f)
            
            self.v2_with_controllers = V2WithControllers(
                strategy=self,
                connectors=self.connectors,
                controller_configs=config.get("controllers", [])
            )
            self.logger().info(f"V2 Strategy initialized with {len(config.get('controllers', []))} controllers from {config_to_load}.")
        except Exception as e:
            self.logger().error(f"Error initializing V2 strategy: {e}")

    def on_tick(self):
        # 1. Check for remote config updates every 10 seconds
        current_time = self.current_timestamp
        if current_time - self.last_config_check > 10:
            self.last_config_check = current_time
            self.check_for_config_updates()

        # 2. Update controllers
        if self.v2_with_controllers:
            self.v2_with_controllers.update_tick()

    def check_for_config_updates(self):
        if not os.path.exists(self.remote_config_path):
            return

        try:
            mtime = os.path.getmtime(self.remote_config_path)
            if mtime > self.last_config_mtime:
                self.last_config_mtime = mtime
                self.logger().info("New remote configuration detected! Reloading controllers...")
                
                with open(self.remote_config_path, "r") as f:
                    config = yaml.safe_load(f)
                
                # Update existing V2WithControllers if it exists
                if self.v2_with_controllers:
                    # Depending on HB version, we might need to recreate or update
                    # Recreating is safer for complete config changes
                    self.v2_with_controllers.stop()
                    self.v2_with_controllers = V2WithControllers(
                        strategy=self,
                        connectors=self.connectors,
                        controller_configs=config.get("controllers", [])
                    )
                    self.logger().info(f"Controllers re-initialized with {len(config.get('controllers', []))} controllers.")
                else:
                    self.initialize_v2()
        except Exception as e:
            self.logger().error(f"Error reloading remote config: {e}")

    def on_stop(self):
        if self.v2_with_controllers:
            self.v2_with_controllers.stop()

    def format_status(self) -> str:
        if self.v2_with_controllers:
            return self.v2_with_controllers.to_format_status()
        return "V2 Strategy not initialized."
