# UnivaPay-for-WooCommerce
UnivaPay Integration Plugin for WooCommerce

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Supported WordPress version: 6.5  
Supported WooCommerce version: 9.1.4

## Environment

This project utilizes Docker for the development environment.

### Services

- `wp`: WordPress for development
- `db`: Database for development
- `wp-cli`: Tools for running WP-CLI, Composer, and tests

### Setup

1. Copy the sample Docker Compose configuration:
    ```sh
    cp docker-compose.sample.yml docker-compose.yml
    ```

2. Start the Docker containers:
    ```sh
    docker compose up -d
    ```

3. Run the following command once to initialize the local environment (WordPress, WooCommerce, and Univapay plugin installation):
    ```sh
    docker compose run --rm wp-cli composer init-local
    ```

## Testing

The `wp-cli` service is used for testing. It sets up a temporary environment, copies necessary WordPress files and plugins, and mounts everything with WP-CLI.

### Tests
Run the tests:
```sh
docker compose run --rm wp-cli composer test
```
