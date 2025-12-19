# ForgeCloud Infrastructure

This directory contains Docker and infrastructure configuration
for running ForgeCloud services in a shared network.

Services:
- dns-server
- gateway (dynamic reverse proxy)

All services communicate over the `forgecloud-net` Docker network.
