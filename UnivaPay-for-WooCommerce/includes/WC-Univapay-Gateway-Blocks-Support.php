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

        // Register custom api endpoint
        add_action('rest_api_init', array($this, 'register_univapay_settings_endpoint'));
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

    public function register_univapay_settings_endpoint() {
        register_rest_route('univapay/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_univapay_settings'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_univapay_settings() {
        if (!WC()->session) {
            return new WP_REST_Response(['error' => 'No session available'], 400);
        }
    
        $current_session_order_id = isset(WC()->session->order_awaiting_payment) ?
            absint(WC()->session->order_awaiting_payment) : absint(WC()->session->get('store_api_draft_order', 0));

        $settings = [
            'title' => $this->gateway->get_title(),
            'description' => $this->gateway->get_description(),
            'support' => array_filter($this->gateway->supports, [ $this->gateway, 'supports' ]),
            'app_id' => $this->gateway->token,
            'capture' => $this->gateway->capture === 'yes',
            'currency' => strtolower(get_woocommerce_currency()),
            'formUrl' => $this->gateway->formurl,
            'order_id' => $current_session_order_id,
        ];

        return new WP_REST_Response($settings, 200);
    }
}
