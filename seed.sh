#!/bin/bash
cd api
docker exec -it travelroot_backend go run -tags seeder seed.go -count 10
cd ..
