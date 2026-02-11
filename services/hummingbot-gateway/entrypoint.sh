#!/bin/bash
set -e

# Prepare folders
mkdir -p /hummingbot/conf
mkdir -p /hummingbot/logs
mkdir -p /hummingbot/data
mkdir -p /hummingbot/scripts

# Start MQTT bridge client using the same python as Hummingbot
/opt/conda/envs/hummingbot/bin/python -u /hummingbot/mqtt_bridge_client.py
