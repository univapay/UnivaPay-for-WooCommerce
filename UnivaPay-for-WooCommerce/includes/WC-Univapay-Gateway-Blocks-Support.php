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
        $current_session_order_id = 0;

        // no session available, when opening site editor on admin page
        if (WC()->session) {
            $current_session_order_id = isset(WC()->session->order_awaiting_payment) ?
                absint(WC()->session->order_awaiting_payment) : absint(WC()->session->get('store_api_draft_order', 0));
        }

        // Avoid using the cart's order price into payment information
        // as it may change during the checkout process (e.g., due to coupons)
        return [
            'title' => $this->gateway->get_title(),
            'description' => $this->gateway->get_description(),
            'support' => array_filter($this->gateway->supports, [ $this->gateway, 'supports' ]),
            'token' => $this->gateway->token,
            'capture' => $this->gateway->capture === 'yes',
            'currency' => strtolower(get_woocommerce_currency()),
            'formUrl' => $this->gateway->formurl,
            'order_id' => $current_session_order_id,
        ];
    }
}
