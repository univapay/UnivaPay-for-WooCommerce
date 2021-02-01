<?php
/*
 * Plugin Name: UnivaPay for WC
 * Plugin URI: https://
 * Description: Take credit card payments on your store.
 * Author: Ryuki Maruyama
 * Author URI: https://daco.dev/
 * Version: 0.1
 *
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
            $this->id = 'wcupg'; // payment gateway plugin ID
            $this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
            $this->has_fields = true; // in case you need a custom credit card form
            $this->method_title = 'Univapay Gateway';
            $this->method_description = 'Credit card payment by univapay'; // will be displayed on the options page
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
            $this->testmode = 'yes' === $this->get_option( 'testmode' );
            $this->publishable_key = $this->get_option( 'publishable_key' );
            $this->seclevel = 'yse' === $this->get_option( 'seclevel' );
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
                    'title'       => 'Enable/Disable',
                    'label'       => 'Enable Univapay Gateway',
                    'type'        => 'checkbox',
                    'description' => '',
                    'default'     => 'no'
                ),
                'title' => array(
                    'title'       => 'Title',
                    'type'        => 'text',
                    'description' => 'This controls the title which the user sees during checkout.',
                    'default'     => 'Credit Card',
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => 'Description',
                    'type'        => 'textarea',
                    'description' => 'This controls the description which the user sees during checkout.',
                    'default'     => 'Pay with your credit card via our super-cool payment gateway.',
                ),
                'testmode' => array(
                    'title'       => 'Test mode',
                    'label'       => 'Enable Test Mode',
                    'type'        => 'checkbox',
                    'description' => 'Place the payment gateway in test mode using test gateway.',
                    'default'     => 'yes',
                    'desc_tip'    => true,
                ),
                'publishable_key' => array(
                    'title'       => 'Live Store ID',
                    'type'        => 'number'
                ),
                'seclevel' => array(
                    'title'       => 'Lower SECLEVEL',
                    'label'       => 'Enable Lower SECLEVEL',
                    'type'        => 'checkbox',
                    'description' => 'In some older environments, unchecking the box may result in a successful payment.',
                    'default'     => 'yes',
                    'desc_tip'    => true,
                ),
            );        
	 	}
 
		/**
		 * custom credit card form
		 */
		public function payment_fields() {
            // display some description before the payment form
            if ( $this->description ) {
                // instructions for test mode
                if ( $this->testmode ) {
                    $this->description .= ' TEST MODE ENABLED. In test mode.';
                    $this->description  = trim( $this->description );
                }
                // display the description with <p> tags etc.
                echo wpautop( wp_kses_post( $this->description ) );
            }
            // Add this action hook that custom payment gateway to support it
            do_action( 'woocommerce_credit_card_form_start', $this->id );
            include(__DIR__.'/univapay.html');
            do_action( 'woocommerce_credit_card_form_end', $this->id );
        }
        // enqueue script and style sheet
	 	public function payment_scripts() {
            // get user id
            global $user_ID;
            // UnivaPay側のエラーメッセージ設定用言語取得
            $lang = substr(get_locale(), 0, 2);
            if(!($lang=='ja' || $lang=='cn' || $lang=='tw'))
                $lang = 'en';
            // need JavaScript to process a token only on cart/checkout pages
            if ( ! is_cart() && ! is_checkout() && ! isset( $_GET['pay_for_order'] ) )
                return;
            // if our payment gateway is disabled, we do not have to enqueue JS too
            if ( 'no' === $this->enabled )
                return;
            // no reason to enqueue JavaScript if Shop id are not set
            if ( empty( $this->publishable_key ) )
                return;
            // do not work with card detailes without SSL unless your website is in a test mode
            if ( ! $this->testmode && ! is_ssl() )
                return;
            // payment processor JavaScript that allows to obtain a token
            wp_enqueue_script( 'univapay_js', 'https://token.ccps.jp/UpcTokenPaymentMini.js' );
            // and this is our custom JS in your plugin directory that works with token.js
            wp_register_script( 'woocommerce_univapay', plugins_url( 'univapay.js', __FILE__ ), array( 'jquery', 'univapay_js' ) );
            // have to use Shop id to obtain a token
            wp_localize_script( 'woocommerce_univapay', 'univapay_params', array(
                'publishableKey' => $this->publishable_key,
                'user_ID' => $user_ID,
                'lang' => $lang
            ) );
            wp_enqueue_script( 'woocommerce_univapay' );
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
            $sod = $this->testmode ? '&sod=testtransaction' : '';
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, 'https://gw.ccps.jp/memberpay.aspx?sid='.$this->publishable_key.'&svid=1&ptype=1&job=CAPTURE&rt=2&upcmemberid='.$_POST['upcmemberid'].$sod.'&siam1='.$order->get_subtotal().'&sisf1='.$order->get_total_shipping());
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, 'GET');
            if($this->seclevel)
                curl_setopt($curl, CURLOPT_SSL_CIPHER_LIST, 'DEFAULT@SECLEVEL=1');
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($curl);
            $error = curl_error($curl);
            curl_close($curl);
         
            if( !$error ) {
                $result_array = explode('&', $response);
                $data = [];
                foreach($result_array as $value) {
                    $data[] = explode('=', $value);
                }
                if ( (int)$data[1] == 1 ) {  
                    /* 決済処理成功の場合はここに処理内容を記載 */  
                    // we received the payment
                    $order->payment_complete();
                    $order->reduce_order_stock();
                    // some notes to customer (replace true with false to make it private)
                    $order->add_order_note( 'Hey, your order is paid! Thank you!', true );
                    // Empty cart
                    $woocommerce->cart->empty_cart();
                    // Redirect to the thank you page
                    return array(
                        'result' => 'success',
                        'redirect' => $this->get_return_url( $order )
                    );
                } else {  
                    /* 決済処理失敗の場合はここに処理内容を記載 */  
                    wc_add_notice('Please try again.', 'error');
                    return;
                }
            } else {
                wc_add_notice('Connection error.', 'error');
                return;
            }
	 	}
 
		/*
		 * In case you need a webhook, like PayPal IPN etc
		 */
		public function webhook() {
	 	}
 	}
}