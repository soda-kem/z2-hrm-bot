#!/bin/bash

# Exit on fail
set -e

# Start services
yarn run start

# Finally call command issued to the docker service
exec "$@"
