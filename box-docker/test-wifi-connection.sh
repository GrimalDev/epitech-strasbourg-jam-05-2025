#!/bin/bash

# Check if device is associated with a WiFi network
if iw dev wlan0 link | grep -q "Connected to"; then
    echo "Connected to WiFi access point"
    exit 0
else
    echo "Not connected to WiFi access point"
    exit 1
fi

