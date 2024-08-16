<?php

if (! defined('ABSPATH')) {
    exit;
}

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

final class WC_Univapay_Gateway_Blocks_Support extends AbstractPaymentMethodType
{
    private $gateway;

    protected $name = 'upfw'; // payment gateway id

    public function initialize()
    {
        // get payment gateway settings
        $this->settings = get_option("wc_{$this->name}_settings", []);
        $gateways = WC()->payment_gateways->payment_gateways();
        $this->gateway = $gateways[ $this->name ];

        // NOTE: we can add hooks to modify the payment gateway data
        // e.g. add_action('woocommerce_store_api_checkout_update_order_from_request', function($order) {
        // ...
        // }, 10, 2);
    }

    public function is_active()
    {
        return $this->gateway->is_available();
    }

    public function get_payment_method_script_handles()
    {
        $block_asset_file = include(plugin_dir_path(__DIR__) . 'dist/block_checkout.bundle.asset.php');

        wp_register_script(
            'upfw-blocks-integration-checkout',
            plugin_dir_url(__DIR__) . 'dist/block_checkout.bundle.js',
            $block_asset_file['dependencies'],
            $block_asset_file['version'],
            true
        );

        return array( 'upfw-blocks-integration-checkout');
    }

    public function get_payment_method_data()
    {
        return [
            'title' => $this->gateway->get_title(),
            'description' => $this->gateway->get_description(),
            'support' => array_filter($this->gateway->supports, [ $this->gateway, 'supports' ]),
            'token' => $this->gateway->token,
            'formUrl' => $this->gateway->formurl
        ];
    }
}
