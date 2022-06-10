<?php
/*
 * Plugin Name: UnivaPay for WooCommerce
 * Plugin URI: https://univapay.com
 * Description: UnivaPayを使用して店舗でクレジットカード決済が可能です。
 * Author: UnivaPay
 * Author URI: https://univapay.com/service/
 * Version: 0.3.0
 */
if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
    require __DIR__ . '/vendor/autoload.php';
}
use Univapay\Resources\Authentication\AppJWT;
use Univapay\UnivapayClient;
use Univapay\UnivapayClientOptions;
use Money\Money;
use Money\Currency;
/*
 * This action hook registers our PHP class as a WooCommerce payment gateway
 */
add_filter( 'woocommerce_payment_gateways', 'Univapay_add_gateway_class' );
function univapay_add_gateway_class( $gateways ) {
	$gateways[] = 'WC_Univapay_Gateway';
	return $gateways;
}
/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action( 'plugins_loaded', 'Univapay_init_gateway_class' );
function Univapay_init_gateway_class() {
	class WC_Univapay_Gateway extends WC_Payment_Gateway {
 		/**
 		 * Class constructor
 		 */
 		public function __construct() {
            $this->id = 'upfw'; // payment gateway plugin ID
            $this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
            $this->has_fields = true; // in case you need a custom credit card form
            $this->method_title = 'Univapay Gateway';
            $this->method_description = __('UnivaPayによるカード支払い', 'upfw'); // will be displayed on the options page
            // gateways can support subscriptions, refunds, saved payment methods
            $this->supports = array(
                'products'
            );
            // Method with all the options fields
            $this->init_form_fields();
            // Load the settings.
            $this->init_settings();
            $this->title = $this->get_option( 'title' );
            $this->description = $this->get_option( 'description' );
            $this->enabled = $this->get_option( 'enabled' );
            $this->widget = $this->get_option( 'widget' );
            $this->api = $this->get_option( 'api' );
            $this->token = $this->get_option( 'token' );
            $this->secret = $this->get_option( 'secret' );
            $this->capture = $this->get_option( 'capture' );
            // This action hook saves the settings
            add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
            // enqueue script and style sheet
            add_action( 'wp_enqueue_scripts', array( $this, 'payment_scripts' ) );
            // You can also register a webhook here
            // add_action( 'woocommerce_api_{webhook name}', array( $this, 'webhook' ) ); 
 		}
 
		/**
 		 * Plugin options, we deal with it in Step 3 too
 		 */
 		public function init_form_fields(){
            $this->form_fields = array(
                'enabled' => array(
                    'title'       => __('有効/無効', 'upfw'),
                    'label'       => 'UnivaPay Gatewayを有効にする',
                    'type'        => 'checkbox',
                    'description' => '',
                    'default'     => 'no'
                ),
                'title' => array(
                    'title'       => __('タイトル', 'upfw'),
                    'type'        => 'text',
                    'description' => __('これは、ユーザーがチェックアウト時に表示するタイトルを制御します。', 'upfw'),
                    'default'     => __('カード支払い', 'upfw'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('説明', 'upfw'),
                    'type'        => 'textarea',
                    'description' => __('これは、チェックアウト時にユーザーが見る説明を制御します。', 'upfw'),
                    'default'     => __('この支払はUnivaPayを介して行われます。', 'upfw'),
                ),
                'widget' => array(
                    'title'       => __('ウィジェット URL', 'upfw'),
                    'type'        => 'text',
                    'default'     => 'https://widget.univapay.com'
                ),
                'api' => array(
                    'title'       => __('API URL', 'upfw'),
                    'type'        => 'text',
                    'default'     => 'https://api.univapay.com'
                ),
                'token' => array(
                    'title'       => __('トークン', 'upfw'),
                    'type'        => 'text'
                ),
                'secret' => array(
                    'title'       => __('シークレット', 'upfw'),
                    'type'        => 'password'
                ),
                'capture' => array(
                    'title'       => __('有効/無効', 'upfw'),
                    'label'       => '常時Captureを取る',
                    'type'        => 'checkbox',
                    'description' => '',
                    'default'     => 'yes'
                ),
            );        
	 	}
 
		/**
		 * custom credit card form
		 */
		public function payment_fields() {
            // display some description before the payment form
            if ( $this->description ) {
                // display the description with <p> tags etc.
                echo wpautop( wp_kses_post( $this->description ) );
            }
        }
        // enqueue script and style sheet
	 	public function payment_scripts() {
            // get user id
            global $user_ID;
            // need JavaScript to process a token only on cart/checkout pages
            if ( ! is_cart() && ! is_checkout() && ! isset( $_GET['pay_for_order'] ) )
                return;
            // if our payment gateway is disabled, we do not have to enqueue JS too
            if ( 'no' === $this->enabled )
                return;
            // no reason to enqueue JavaScript if Shop id are not set
            if ( empty( $this->token ) )
                return;
            // payment processor JavaScript that allows to obtain a token
            wp_enqueue_script( 'univapay_checkout', $this->widget.'/client/checkout.js', array(), null, true );
            // and this is our custom JS in your plugin directory that works with token.js
            wp_enqueue_script( 'univapay_woocommerce', plugins_url( 'univapay.js', __FILE__ ), array( 'jquery', 'univapay_checkout' ), null, true );
            // have to use Shop id to obtain a token
            wp_localize_script( 'univapay_woocommerce', 'univapay_params', array(
                'token' => $this->token
            ) );
	 	}
 
		/*
 		 * Fields validation
		 */
		public function validate_fields() {
		}
 
		/*
		 * We're processing the payments here, everything about
		 */
		public function process_payment( $order_id ) {
            global $woocommerce;
            // we need it to get any order detailes
            $order = wc_get_order( $order_id );
            
            if(!isset($_POST['charge_token'])) {
                wc_add_notice(__('決済エラーサイト管理者にお問い合わせください。', 'upfw'), 'error');
                return;
            }
            // charge from charge token
            $clientOptions = new UnivapayClientOptions($this->api);
            $token = AppJWT::createToken($this->token, $this->secret);
            $client = new UnivapayClient($token, $clientOptions);
            $money = new Money($order->data["total"], new Currency($order->data["currency"]));
            $capture = $this->capture === 'yes';
            $charge = $client->createCharge($_POST['charge_token'], $money, $capture)->awaitResult();
            if($charge->error) {
                wc_add_notice(__('決済エラー入力内容を確認してください。', 'upfw').$charge->error["details"], 'error');
                return;
            }
            if($capture) {
                // we received the payment
                $order->payment_complete();
                // add comment for order can see admin panel
                $order->add_order_note( __('UnivaPayでの支払が完了いたしました。', 'upfw'), true );
            } else {
                // add comment for order can see admin panel
                $order->add_order_note( __('UnivaPayでのオーソリが完了いたしました。', 'upfw'), true );
            }
            // save charge id
            $order->update_meta_data('univapay_charge_id', $charge->id);
            // Change the number of stock
            wc_reduce_stock_levels($order_id);
            // Empty cart
            $woocommerce->cart->empty_cart();
            // Redirect to the thank you page
            return array(
                'result' => 'success',
                'redirect' => $this->get_return_url( $order )
            );
	 	}
 
		/*
		 * In case you need a webhook, like PayPal IPN etc
		 */
		public function webhook() {
	 	}
 	}
}
