<?php

namespace Univapay\WooCommerce\Tests;

/**
 * Univapay Config Settings Tests
 */
class TestWCPaymentsSetting extends BasePluginTest {

	/**
	 * Test that the Univapay payment method is registered and displayed on the WooCommerce settings page.
	 */
	public function test_univapay_payment_methods_displayed_on_settings_page() {
		$installed_payment_methods = WC()->payment_gateways->payment_gateways();

		$payment_method_ids = array_map(
			function ( $method ) {
				return $method->id;
			},
			$installed_payment_methods
		);

		$this->assertContains( 'upfw', $payment_method_ids, 'Payment method Univapay ID "upfw" is not present.' );
	}

	/**
	 * Test that all expected settings fields are present in the Univapay settings form and have the correct titles.
	 */
	public function test_univapay_settings_fields_displayed() {
		$univapay_gateway = WC()->payment_gateways()->payment_gateways()['upfw'];

		$settings_fields = $univapay_gateway->get_form_fields();

		$expected_fields = array(
			'enabled'     => '有効/無効',
			'title'       => 'タイトル',
			'description' => '説明',
			'widget'      => 'ウィジェット URL',
			'api'         => 'API URL',
			'token'       => 'トークン',
			'secret'      => 'シークレット',
			'capture'     => '有効/無効',
			'status'      => 'オーソリ時のステータス',
			'formurl'     => 'フォームURL',
		);

		foreach ( $expected_fields as $field_key => $field_title ) {
			$this->assertArrayHasKey( $field_key, $settings_fields, "Field '$field_key' is not present in Univapay settings." );
			$this->assertEquals( $field_title, $settings_fields[ $field_key ]['title'], "Field '$field_key' does not have the expected title '$field_title'." );
		}
	}

	/**
	 * Test that when settings are updated via the admin interface, the new values are correctly saved and can be retrieved using the get_option method.
	 */
	public function test_univapay_settings_post_and_get_consistency() {
		$univapay_gateway = WC()->payment_gateways()->payment_gateways()['upfw'];

		$posted_settings = array(
			'enabled'     => 'yes',
			'title'       => 'test title',
			'description' => 'test description',
			'widget'      => 'https://test.example.com/widget/checkout.js',
			'api'         => 'https://test.api.example.com',
			'token'       => 'test token',
			'secret'      => 'test secret',
			'capture'     => 'yes',
			'status'      => 'on-hold',
		);

		foreach ( $posted_settings as $key => $value ) {
			$univapay_gateway->update_option( $key, $value );
		}

		$univapay_gateway = WC()->payment_gateways()->payment_gateways()['upfw'];

		$updated_settings = array();
		foreach ( $posted_settings as $key => $value ) {
			$updated_settings[ $key ] = $univapay_gateway->get_option( $key );
		}

		foreach ( $posted_settings as $key => $value ) {
			$this->assertEquals( $value, $updated_settings[ $key ], "Setting '$key' was not updated correctly." );
		}
	}
}
