<?php
/*
 * Plugin Name: UnivaPay for WooCommerce
 * Plugin URI: https://univapay.com
 * Description: UnivaPayを使用して店舗でクレジットカード決済が可能です。
 * Author: UnivaPay
 * Author URI: https://univapay.com
 * Version: 0.2.1
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
            $this->publishable_key = $this->get_option( 'publishable_key' );
            $this->seclevel = 'yes' === $this->get_option( 'seclevel' );
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
                'publishable_key' => array(
                    'title'       => __('店舗ID', 'upfw'),
                    'type'        => 'number'
                ),
                'seclevel' => array(
                    'title'       => __('低いSECLEVEL', 'upfw'),
                    'label'       => __('低いSECLEVELを有効化', 'upfw'),
                    'type'        => 'checkbox',
                    'description' => __('古い環境では、チェックを外すと支払いが成功する場合があります。', 'upfw'),
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
            // do not work with card detailes without SSL
            // if ( ! is_ssl() )
            //     return;
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
            $sod = '&sod='.$order_id;
            // add low security option
            if($this->seclevel) {
                add_action( 'http_api_curl', 'lowsec_config', 10, 3 );
                function lowsec_config(&$handle, $args, $url){
                    curl_setopt($handle, CURLOPT_SSL_CIPHER_LIST, 'DEFAULT@SECLEVEL=1');
                    return $handle;
                }
            }
            $res = wp_remote_get('https://gw.ccps.jp/memberpay.aspx?sid='.$this->publishable_key.'&svid=1&ptype=1&job=CAPTURE&rt=2&upcmemberid='.$_POST['upcmemberid'].$sod.'&siam1='.$order->get_subtotal().'&sisf1='.$order->get_total_shipping());
         
            if( !is_wp_error($res) ) {
                $response = $res["body"];
                $result_array = explode('&', $response);
                $data = [];
                foreach($result_array as $value) {
                    list($k, $v) = explode('=', $value);
                    $data[$k] = $v;
                }
                if ( (int)$data['rst'] == 1 ) {
                    /* 決済処理成功の場合はここに処理内容を記載 */  
                    // we received the payment
                    $order->payment_complete();
                    // Change the number of stock
                    wc_reduce_stock_levels($order_id);
                    // some notes to customer (replace true with false to make it private)
                    $order->add_order_note( __('UnivaPayでの支払が完了いたしました。', 'upfw'), true );
                    // Empty cart
                    $woocommerce->cart->empty_cart();
                    // Redirect to the thank you page
                    return array(
                        'result' => 'success',
                        'redirect' => $this->get_return_url( $order )
                    );
                } else {  
                    /* 決済処理失敗の場合はここに処理内容を記載 */  
                    wc_add_notice(__('決済エラー入力内容を確認してください。', 'upfw').$data['ec'], 'error');
                    return;
                }
            } else {
                wc_add_notice(__('決済エラーサイト管理者にお問い合わせください。', 'upfw'), 'error');
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
