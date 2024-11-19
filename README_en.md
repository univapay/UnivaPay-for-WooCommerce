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

2. Initialize the local environment:
```sh
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer init:local"
```

3. If you want to start the hot-reload module:
```sh
docker compose exec wp bash
cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce
npm run start
```

### Testing

#### Unit Test

Preparation:
- Complete step 2 of the setup process.

Command to run the tests:

```sh
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer test"
```

#### E2E Test

Preparation:

- Complete step 2 of the setup process.
- Set up a Univapay staging account and export the environment variables as specified in the [.env](./.env.e2e) file on the host environment.

Command to run the tests:

```sh
# for block checkout
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer init:e2e && npm run test:e2e:block"
# for classic checkout
docker compose exec wp /bin/bash -c "cd /var/www/html/wp-content/plugins/UnivaPay-for-WooCommerce && composer init:e2e && ./bin/wc-checkout-change-layout.sh && npm run test:e2e:classic"
```
