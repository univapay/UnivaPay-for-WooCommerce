DB_HOST="localhost"
DB_USER="root"
DB_PASS="wordpress"
DB_DATABASE="wordpress"
CHECKOUT_TYPE="block"

if CHECKOUT_TYPE="classic"; then
mysql -u root -pwordpress -h wp-db wordpress -e "
UPDATE wp_posts 
SET 
    post_author = 1,
    post_date = '2024-10-21 03:06:23',
    post_date_gmt = '2024-10-21 03:06:23',
    post_content = '<!-- wp:template-part {\"slug\":\"checkout-header\",\"theme\":\"woocommerce/woocommerce\",\"tagName\":\"header\"} /-->\n\n<!-- wp:woocommerce/classic-shortcode {\"shortcode\":\"checkout\"} /-->',
    post_title = 'Page: Checkout',
    post_excerpt = 'The Checkout template guides users through the final steps of the purchase process. It enables users to enter shipping and billing information, select a payment method, and review order details.',
    post_status = 'publish',
    comment_status = 'closed',
    ping_status = 'closed',
    post_password = '',
    post_name = 'page-checkout',
    to_ping = '',
    pinged = '',
    post_modified = '2024-10-21 03:51:15',
    post_modified_gmt = '2024-10-21 03:51:15',
    post_content_filtered = '',
    post_parent = 0,
    guid = 'http://localhost:3080/?p=15',
    menu_order = 0,
    post_type = 'wp_template',
    post_mime_type = '',
    comment_count = 0
WHERE ID = 15;
"
elif CHECKOUT_TYPE="block"; then
mysql -u root -pwordpress -h wp-db wordpress -e "
UPDATE wp_posts 
SET 
    post_author = 1,
    post_date = '2024-10-21 03:06:23',
    post_date_gmt = '2024-10-21 03:06:23',
    post_content = '<!-- wp:template-part {\"slug\":\"checkout-header\",\"theme\":\"woocommerce/woocommerce\",\"tagName\":\"header\"} /-->\n\n<!-- wp:woocommerce/checkout -->\n<div class=\"wp-block-woocommerce-checkout alignwide wc-block-checkout is-loading\"><!-- wp:woocommerce/checkout-totals-block -->\n<div class=\"wp-block-woocommerce-checkout-totals-block\"><!-- wp:woocommerce/checkout-order-summary-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-block\"><!-- wp:woocommerce/checkout-order-summary-cart-items-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-cart-items-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-cart-items-block -->\n\n<!-- wp:woocommerce/checkout-order-summary-coupon-form-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-coupon-form-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-coupon-form-block -->\n\n<!-- wp:woocommerce/checkout-order-summary-totals-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-totals-block\"><!-- wp:woocommerce/checkout-order-summary-subtotal-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-subtotal-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-subtotal-block -->\n\n<!-- wp:woocommerce/checkout-order-summary-fee-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-fee-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-fee-block -->\n\n<!-- wp:woocommerce/checkout-order-summary-discount-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-discount-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-discount-block -->\n\n<!-- wp:woocommerce/checkout-order-summary-shipping-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-shipping-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-shipping-block -->\n\n<!-- wp:woocommerce/checkout-order-summary-taxes-block -->\n<div class=\"wp-block-woocommerce-checkout-order-summary-taxes-block\"></div>\n<!-- /wp:woocommerce/checkout-order-summary-taxes-block --></div>\n<!-- /wp:woocommerce/checkout-order-summary-totals-block --></div>\n<!-- /wp:woocommerce/checkout-order-summary-block --></div>\n<!-- /wp:woocommerce/checkout-totals-block -->\n\n<!-- wp:woocommerce/checkout-fields-block -->\n<div class=\"wp-block-woocommerce-checkout-fields-block\"><!-- wp:woocommerce/checkout-express-payment-block -->\n<div class=\"wp-block-woocommerce-checkout-express-payment-block\"></div>\n<!-- /wp:woocommerce/checkout-express-payment-block -->\n\n<!-- wp:woocommerce/checkout-contact-information-block -->\n<div class=\"wp-block-woocommerce-checkout-contact-information-block\"></div>\n<!-- /wp:woocommerce/checkout-contact-information-block -->\n\n<!-- wp:woocommerce/checkout-shipping-method-block -->\n<div class=\"wp-block-woocommerce-checkout-shipping-method-block\"></div>\n<!-- /wp:woocommerce/checkout-shipping-method-block -->\n\n<!-- wp:woocommerce/checkout-pickup-options-block -->\n<div class=\"wp-block-woocommerce-checkout-pickup-options-block\"></div>\n<!-- /wp:woocommerce/checkout-pickup-options-block -->\n\n<!-- wp:woocommerce/checkout-shipping-address-block -->\n<div class=\"wp-block-woocommerce-checkout-shipping-address-block\"></div>\n<!-- /wp:woocommerce/checkout-shipping-address-block -->\n\n<!-- wp:woocommerce/checkout-billing-address-block -->\n<div class=\"wp-block-woocommerce-checkout-billing-address-block\"></div>\n<!-- /wp:woocommerce/checkout-billing-address-block -->\n\n<!-- wp:woocommerce/checkout-shipping-methods-block -->\n<div class=\"wp-block-woocommerce-checkout-shipping-methods-block\"></div>\n<!-- /wp:woocommerce/checkout-shipping-methods-block -->\n\n<!-- wp:woocommerce/checkout-payment-block -->\n<div class=\"wp-block-woocommerce-checkout-payment-block\"></div>\n<!-- /wp:woocommerce/checkout-payment-block -->\n\n<!-- wp:woocommerce/checkout-additional-information-block -->\n<div class=\"wp-block-woocommerce-checkout-additional-information-block\"></div>\n<!-- /wp:woocommerce/checkout-additional-information-block -->\n\n<!-- wp:woocommerce/checkout-order-note-block -->\n<div class=\"wp-block-woocommerce-checkout-order-note-block\"></div>\n<!-- /wp:woocommerce/checkout-order-note-block -->\n\n<!-- wp:woocommerce/checkout-terms-block -->\n<div class=\"wp-block-woocommerce-checkout-terms-block\"></div>\n<!-- /wp:woocommerce/checkout-terms-block -->\n\n<!-- wp:woocommerce/checkout-actions-block -->\n<div class=\"wp-block-woocommerce-checkout-actions-block\"></div>\n<!-- /wp:woocommerce/checkout-actions-block --></div>\n<!-- /wp:woocommerce/checkout-fields-block --></div>\n<!-- /wp:woocommerce/checkout -->',
    post_title = 'Page: Checkout',
    post_excerpt = 'The Checkout template guides users through the final steps of the purchase process. It enables users to enter shipping and billing information, select a payment method, and review order details.',
    post_status = 'publish',
    comment_status = 'closed',
    ping_status = 'closed',
    post_password = '',
    post_name = 'page-checkout',
    to_ping = '',
    pinged = '',
    post_modified = '2024-10-21 04:05:31',
    post_modified_gmt = '2024-10-21 04:05:31',
    post_content_filtered = '',
    post_parent = 0,
    guid = 'http://localhost:3080/?p=15',
    menu_order = 0,
    post_type = 'wp_template',
    post_mime_type = '',
    comment_count = 0
WHERE ID = 15;
"
fi
