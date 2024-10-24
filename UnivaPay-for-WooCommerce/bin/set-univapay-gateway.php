<?php

require_once __DIR__ . "/../../../../wp-load.php";
require_once __DIR__ . "/../../../../wp-content/plugins/woocommerce/woocommerce.php";

// Univapay Gateway
update_option('woocommerce_upfw_settings', array(
    'enabled' => 'yes',
    'api' => getenv('E2E_API'),
    'widget' => getenv('E2E_WIDGET'),
    'token' => getenv('E2E_TOKEN'),
    'secret' => getenv('E2E_SECRET'),
    'capture' => getenv('E2E_CAPTURE'),
    'formurl' => getenv('E2E_FORMURL'),
));
