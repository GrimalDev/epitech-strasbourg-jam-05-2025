#!/bin/bash
sudo killall wpa_supplicant

SSID=$1
PASSWORD=$2

if [ -z "$SSID" ] || [ -z "$PASSWORD" ]; then
        echo "Usage: $0 <SSID> <Password>"
        exit 1
fi

echo "Connecting to wifi: $SSID"

sudo systemctl stop hostapd
sudo systemctl stop dnsmasq

sudo ip addr flush dev wlan0

sudo bash -c "wpa_passphrase '$SSID' '$PASSWORD' > /etc/wpa_supplicant/wpa_supplicant.conf"

sudo systemctl unmask wpa_supplicant
sudo systemctl enable wpa_supplicant
sudo systemctl start wpa_supplicant

sudo ip link set wlan0 down
sleep 1
sudo ip link set wlan0 up

#verify the file is there
if [ ! -f /etc/wpa_supplicant/wpa_supplicant.conf ]; then
    echo "wpa_supplicant.conf file not found!"
    exit 1
fi

sudo bash -c "wpa_supplicant -B -c /etc/wpa_supplicant/wpa_supplicant.conf -i wlan0"

sudo systemctl restart dhcpcd

echo "wifi should now be connected to $SSID."

docker build -t ssh-ctf -f Dockerfile_challenge .
docker run -d -p 2222:22 --name ssh-challenge ssh-ctf

echo "challenge started"
