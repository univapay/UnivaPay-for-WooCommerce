# ref:https://developer.woocommerce.com/docs/woocommerce-cli-commands/
BASE_CMD='wp wc --user=1'

create_product() {
    $BASE_CMD product create --name="Test Product 1" --sku="test-product-1" --regular_price=1000 --stock_quantity=10
    $BASE_CMD product create --name="Test Product 2" --sku="test-product-2" --regular_price=2000 --stock_quantity=20
}

create_coupon() {
    $BASE_CMD shop_coupon create --code="TESTCOUPON" --amount=10 --discount_type=percent --individual_use=true
}

create_product
create_coupon
