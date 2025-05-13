#!/bin/bash

# This script is used to start the server for the MissClickNet model.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

if command -v docker-compose &> /dev/null; then
    echo "Starting MissClickNet server with docker-compose..."
    docker-compose up -d
elif command -v docker compose &> /dev/null; then
    echo "Starting MissClickNet server with docker compose..."
    docker compose up -d
else
    echo "Error: Docker Compose is not installed or not in the PATH."
    exit 1
fi