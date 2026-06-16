<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType;

/**
 * Class WC_Univapay_Gateway_Blocks_Support
 *
 * This class integrates the Univapay payment gateway with WooCommerce Blocks.
 *
 * @package UnivaPay_For_WooCommerce
 */
final class WC_Univapay_Gateway_Blocks_Support extends AbstractPaymentMethodType {

	/**
	 * @var WC_Univapay_Gateway
	 */
	private $gateway;

	/**
	 * @var string
	 */
	protected $name = 'upfw';

	/**
	 * Initialize the payment method type.
	 */
	public function initialize() {
		$this->settings = get_option( "wc_{$this->name}_settings", array() );
		$gateways       = WC()->payment_gateways->payment_gateways();
		$this->gateway  = $gateways[ $this->name ];
	}

	/**
	 * Check if the payment method is active.
	 *
	 * @return bool
	 */
	public function is_active() {
		return $this->gateway->is_available();
	}

	/**
	 * Get the script handles required for the payment method.
	 *
	 * @return array
	 */
	public function get_payment_method_script_handles() {
		$block_asset_file = include plugin_dir_path( __DIR__ ) . 'dist/block_checkout.bundle.asset.php';

		wp_register_script(
			'upfw-blocks-integration-checkout',
			plugin_dir_url( __DIR__ ) . 'dist/block_checkout.bundle.js',
			$block_asset_file['dependencies'],
			$block_asset_file['version'],
			true
		);

		return array( 'upfw-blocks-integration-checkout' );
	}

	/**
	 * Get the payment method data to be passed to the frontend.
	 *
	 * @return array
	 */
	public function get_payment_method_data() {
		return array(
			'title'       => $this->gateway->get_title(),
			'description' => $this->gateway->get_description(),
			'support'     => array_filter( $this->gateway->supports, array( $this->gateway, 'supports' ) ),
			'app_id'      => $this->gateway->token,
			'capture'     => 'yes' === $this->gateway->capture,
			'currency'    => strtolower( get_woocommerce_currency() ),
			'formUrl'     => $this->gateway->formurl,
		);
	}
}
