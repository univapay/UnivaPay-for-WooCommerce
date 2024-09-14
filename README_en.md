# UnivaPay-for-WooCommerce
UnivaPay Integration Plugin for WooCommerce

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[WordPress and WooCommerce related information](./UnivaPay-for-WooCommerce/readme.txt)

## Environment

This project utilizes Docker for the development environment.

### Setup

1. Start the Docker containers:
    ```sh
    docker compose up -d
    ```

2. Access the container:
    ```sh
    docker compose exec wp bash
    ```

3. Initialize the local environment:
    ```sh
    cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce
    composer init-local
    npm run start
    ```

### Testing

Run the tests:
```sh
composer test
```


