<?php
/**
 * Plugin Name: UnivaPay for WooCommerce
 * Plugin URI: https://univapay.com
 * Description: UnivaPayを使用して店舗でクレジットカード決済が可能です。
 * Author: UnivaPay
 * Author URI: https://univapay.com/service/
 * Version: 0.4.7
 *
 * @package UnivaPay-for-WooCommerce
 */

if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
}

use Univapay\Resources\Authentication\AppJWT;
use Univapay\UnivapayClient;
use Univapay\UnivapayClientOptions;

add_action( 'plugins_loaded', 'univapay_init_gateway_class' );
/**
 * Initialize the gateway class and register it as a WooCommerce payment gateway
 */
function univapay_init_gateway_class() {
	if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
		return;
	}

	require_once plugin_dir_path( __FILE__ ) . 'includes/WC-Univapay-Constants.php';
	require_once plugin_dir_path( __FILE__ ) . 'includes/WC-Univapay-Gateway.php';

	add_filter( 'woocommerce_payment_gateways', 'univapay_add_gateway_class' );
	add_action( 'woocommerce_blocks_loaded', 'univapay_register_order_approval_payment_method_type' );
	add_action( 'add_meta_boxes', 'add_custom_boxes' );

	/**
	 * This action hook registers our PHP class as a WooCommerce payment gateway
	 *
	 * @param array $gateways Array of registered WooCommerce payment gateway classes.
	 */
	function univapay_add_gateway_class( $gateways ) {
		$gateways[] = 'WC_Univapay_Gateway';
		return $gateways;
	}

	/**
	 * Add a custom meta box to the order details page in the admin panel to display UnivaPay status
	 */
	function add_custom_boxes() {
		global $post;
		if ( empty( $post ) ) {
			return;
		}
		$payment_method = get_post_meta( $post->ID, '_payment_method' );
		if ( empty( $payment_method ) || 'upfw' !== $payment_method[0] ) {
			return;
		}
		add_meta_box(
			'univapay_status_box',
			__( 'UnivaPayステータス' ),
			'custom_metabox_content',
			'shop_order',
			'side',
			'default'
		);
	}

	/**
	 * Display the UnivaPay status and action buttons in the custom meta box
	 *
	 * @param WP_Post $post The current post object for the order.
	 */
	function custom_metabox_content( $post ) {
		$settings       = WC()->payment_gateways->payment_gateways()['upfw'];
		$client_options = new UnivapayClientOptions( $settings->get_option( 'api' ) );
		$token          = AppJWT::createToken( $settings->get_option( 'token' ), $settings->get_option( 'secret' ) );
		$client         = new UnivapayClient( $token, $client_options );
		$charge_id      = get_post_meta( $post->ID, 'univapay_charge_id' );
		if ( ! $charge_id ) {
			echo 'UnivaPayで決済を試みましたが、決済が完了していません。';
			return;
		}
		$charge = $client->getCharge( $token->storeId, $charge_id[0] );

		$data = json_decode( file_get_contents( 'php://input' ), true );
		if ( isset( $data['univapay_update'] ) ) {
			$order = wc_get_order( $post );
			switch ( $data['univapay_update'] ) {
				case 'capture':
					$charge->capture();
					$order->payment_complete();
					$order->add_order_note( __( 'UnivaPayでの支払が完了いたしました。', 'upfw' ), true );
					break;
				default:
					break;
			}
			$order->save();
		}

		echo '<h4>ステータス: ' . esc_attr( $charge->status->getValue() ) . '</h4>';
		switch ( $charge->status->getValue() ) {
			case 'authorized':
				echo '<button type="button" class="button button-primary"' .
					' onclick="update(event)" value="capture">キャプチャ</button>';
				break;
			default:
				break;
		}
		?>
			<script>
				update = (e) => {
					e.preventDefault();
					e.target.disabled = true;
					const xhttp = new XMLHttpRequest();
					xhttp.onload = function() {
						if(this.status !== 200) {
							alert('エラーが発生しました。再度お試しください。');
						}
						location.reload();
					}
					xhttp.open("POST", "", true);
					xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					xhttp.send(JSON.stringify({univapay_update: e.target.value}));
				}
			</script>
		<?php
	}

	/**
	 * Register univapay gateway block support
	 */
	function univapay_register_order_approval_payment_method_type() {
		if ( ! class_exists( 'Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType' ) ) {
			return;
		}

		require_once plugin_dir_path( __FILE__ ) . 'includes/WC-Univapay-Gateway-Blocks-Support.php';
		add_action(
			'woocommerce_blocks_payment_method_type_registration',
			function ( Automattic\WooCommerce\Blocks\Payments\PaymentMethodRegistry $payment_method_registry ) {
				$payment_method_registry->register( new WC_Univapay_Gateway_Blocks_Support() );
			}
		);
	}
}
