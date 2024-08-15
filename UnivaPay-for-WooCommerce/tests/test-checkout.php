<?php

class TestCheckout extends BasePluginTest {

    function setUp(): void {
        parent::setUp();
        $payment_gateways = WC()->payment_gateways()->payment_gateways();
        if (isset($payment_gateways['upfw'])) {
            $payment_gateways['upfw']->enabled = 'yes';
        } else {
            $this->fail('Custom payment gateway "upfw" is not registered.');
        }

        // Create a mock product and add it to the cart
        $product = new WC_Product_Simple();
        $product->set_name('Test Product');
        $product->set_price(1000);
        $product->set_regular_price(1000);
        $product->set_sku('test-product');
        $product->save();
        WC()->cart->add_to_cart($product->get_id());

        // Simulate a customer session
        WC()->session = new WC_Session_Handler();
        WC()->session->init();
        WC()->customer = new WC_Customer(get_current_user_id(), true);
    }

    function test_custom_payment_gateway_displayed_on_classic_checkout() {
        ob_start();
        wc_get_template('checkout/payment.php', array(
            'checkout' => WC()->checkout(),
            'available_gateways' => WC()->payment_gateways()->get_available_payment_gateways(),
            'order_button_text' => __( 'Place order', 'woocommerce' ),
        ));
        $output = ob_get_clean();

        $this->assertStringContainsString('id="payment_method_upfw"', $output, 'Custom payment gateway "upfw" is not displayed on the checkout page.');
    }

    function test_custom_payment_gateway_displayed_on_block_checkout() {
        update_option('woocommerce_blocks_checkout_enabled', 'yes');

        ob_start();
        do_action('woocommerce_blocks_checkout_page');
        $output = ob_get_clean();

        $this->assertStringNotContainsString('id="payment_method_upfw"', $output, 'Custom payment gateway "upfw" is not displayed on the checkout page.');
    }
}
