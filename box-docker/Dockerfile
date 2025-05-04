# Use an official PHP image with Apache
FROM php:8.3-apache

# Switch to root to install packages
USER root

# Install networking tools (NetworkManager for nmcli example)
# Also install sudo if you were attempting (DON'T) to give www-data sudo rights
RUN apt-get update && apt-get install -y --no-install-recommends \
    network-manager \
    # sudo \ # Example - DON'T DO THIS FOR REAL
    && rm -rf /var/lib/apt/lists/*

# Copy the single PHP file to be the default index page
COPY index.php /var/www/html/index.php

# Fix potential permissions if needed (Apache runs as www-data)
RUN chown www-data:www-data /var/www/html/index.php

# DANGEROUS: Example of adding www-data to sudoers (STRONGLY DISCOURAGED)
# This allows www-data to run nmcli without a password. HUGE SECURITY RISK.
# RUN echo "www-data ALL=(ALL) NOPASSWD: /usr/bin/nmcli" >> /etc/sudoers

# Switch back to the default Apache user (though execution context might still need root privileges depending on Docker flags)
# USER www-data

# Apache starts automatically via the base image CMD
