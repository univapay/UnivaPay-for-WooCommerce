#!/usr/bin/env bash

# wordpress cli ref:https://developer.wordpress.org/cli/commands/
BASE_WP_CMD='wp option update'
# woocommerce cli ref:https://developer.woocommerce.com/docs/woocommerce-cli-commands/
BASE_WC_CMD='wp wc --user=1'

update_store() {
    $BASE_WP_CMD woocommerce_default_country "JP:13"
    $BASE_WP_CMD woocommerce_store_address "東京都港区六本木1-1-1"
    $BASE_WP_CMD woocommerce_store_address_2 "テストビル1F"
    $BASE_WP_CMD woocommerce_currency "JPY"
}

create_product() {
    $BASE_WC_CMD product create --name="Test Product 1" --sku="test-product-1" --regular_price=1000 --stock_quantity=10
    $BASE_WC_CMD product create --name="Test Product 2" --sku="test-product-2" --regular_price=2000 --stock_quantity=20
}

create_coupon() {
    $BASE_WC_CMD shop_coupon create --code="testcoupon" --amount=10 --discount_type=percent --individual_use=true
}

update_store
create_product
create_coupon
