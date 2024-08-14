<?php
/*
 * Plugin Name: UnivaPay for WooCommerce
 * Plugin URI: https://univapay.com
 * Description: UnivaPayを使用して店舗でクレジットカード決済が可能です。
 * Author: UnivaPay
 * Author URI: https://univapay.com/service/
 * Version: 0.3.7
 */
if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
    require __DIR__ . '/vendor/autoload.php';
}

/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action( 'plugins_loaded', 'univapay_init_gateway_class' );
function univapay_init_gateway_class() {
    if ( !class_exists( 'WC_Payment_Gateway' ) ) return;
    require_once plugin_dir_path( __FILE__ ) . 'includes/WC-Univapay-Gateway.php';
    add_filter( 'woocommerce_payment_gateways', 'univapay_add_gateway_class' );
    add_action( 'woocommerce_blocks_loaded', 'univapay_register_order_approval_payment_method_type' );

    /*
    * This action hook registers our PHP class as a WooCommerce payment gateway
    */
    function univapay_add_gateway_class( $gateways ) {
        $gateways[] = 'WC_Univapay_Gateway';
        return $gateways;
    }

    /**
     * Register univapay gateway block support
     */
    function univapay_register_order_approval_payment_method_type() {
        if ( ! class_exists( 'Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType' ) ) {
            return;
        }

        // only register if the checkout block is enabled, otherwise will block the classic checkout
        // TODO: update univapay.js to support both ways
        // if ( class_exists( 'Automattic\WooCommerce\Blocks\Utils\FeatureGating' ) && Automattic\WooCommerce\Blocks\Utils\FeatureGating::is_feature_enabled( 'woocommerce_blocks_checkout' ) ) {
        require_once plugin_dir_path( __FILE__ ) . 'includes/WC-Univapay-Gateway-Blocks-Support.php';
        add_action(
            'woocommerce_blocks_payment_method_type_registration',
            function( Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry ) {
                $payment_method_registry->register( new WC_Univapay_Gateway_Blocks_Support() );
            }
        );
        // }
    }
}
