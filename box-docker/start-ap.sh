#!/bin/bash
echo "Starting Access Point mode..."

sudo systemctl stop wpa_supplicant
sudo killall wpa_supplicant

sudo dhclient -r wlan0 || true

sudo ip link set wlan0 down
sleep 1


sudo ip link set wlan0 up
sudo ifconfig wlan0 192.168.4.1 netmask 255.255.255.0 up

sudo systemctl restart hostapd
sudo systemctl restart dnsmasq

echo "Acess Point is now active on 192.168.4.1"
