<?php
/*
 * Plugin Name: WooCommerce UnivaPay Plugin
 * Plugin URI: https://
 * Description: Take credit card payments on your store.
 * Author: Ryuki Maruyama
 * Author URI: https://daco.dev/
 * Version: 0.1
 *

 /*
 * This action hook registers our PHP class as a WooCommerce payment gateway
 */
add_filter( 'woocommerce_payment_gateways', 'wcupp_add_gateway_class' );
function wcupp_add_gateway_class( $gateways ) {
	$gateways[] = 'WC_Wcupp_Gateway'; // your class name is here
	return $gateways;
}
 
/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action( 'plugins_loaded', 'Wcupp_init_gateway_class' );
function wcupp_init_gateway_class() {
 
	class WC_Wcupp_Gateway extends WC_Payment_Gateway {
 
 		/**
 		 * Class constructor, more about it in Step 3
 		 */
 		public function __construct() {
 
		...
 
 		}
 
		/**
 		 * Plugin options, we deal with it in Step 3 too
 		 */
 		public function init_form_fields(){
 
		...
 
	 	}
 
		/**
		 * You will need it if you want your custom credit card form, Step 4 is about it
		 */
		public function payment_fields() {
 
		...
 
		}
 
		/*
		 * Custom CSS and JS, in most cases required only when you decided to go with a custom credit card form
		 */
	 	public function payment_scripts() {
 
		...
 
	 	}
 
		/*
 		 * Fields validation, more in Step 5
		 */
		public function validate_fields() {
 
		...
 
		}
 
		/*
		 * We're processing the payments here, everything about it is in Step 5
		 */
		public function process_payment( $order_id ) {
 
		...
 
	 	}
 
		/*
		 * In case you need a webhook, like PayPal IPN etc
		 */
		public function webhook() {
 
		...
 
	 	}
 	}
}