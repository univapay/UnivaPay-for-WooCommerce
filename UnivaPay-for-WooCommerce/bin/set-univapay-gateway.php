<?php

$dirPath = __DIR__ . "/../../../../";

require_once $dirPath . "wp-load.php";
require_once $dirPath . "wp-content/plugins/woocommerce/woocommerce.php";

// Univapay Gateway
update_option('woocommerce_upfw_settings', array(
    'enabled' => 'yes',
    'api' => getenv('E2E_API_URL'),
    'widget' => getenv('E2E_WIDGET_URL'),
    'token' => getenv('E2E_TOKEN'),
    'secret' => getenv('E2E_SECRET'),
    'capture' => getenv('E2E_CAPTURE'),
    'formurl' => getenv('E2E_FORM_URL'),
));
