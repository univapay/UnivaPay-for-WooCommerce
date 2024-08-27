<?php

namespace Univapay\WooCommerce\Tests;

use Money\Money;
use Money\Currency;

class TestPaymentProcessing extends BasePluginTest
{
    public function test_redirect_url_is_generated_correctly()
    {
        $order = $this->initiate_mock_order($this->initiate_mock_product());
        $_POST['univapay_optional'] = 'true';
        $result = $this->payment_gateways['upfw']->process_payment($order->get_id());
        $money = new Money($order->get_data()["total"], new Currency($order->get_data()["currency"]));
        $metatag = array(
            'order_id' => $order->get_id(),
        );

        $expectedRedirectUrl = $this->payment_gateways['upfw']->formurl .
            '?appId=' . $this->payment_gateways['upfw']->token .
            '&emailAddress=' . $order->get_billing_email() .
            '&name=' . $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() .
            '&phoneNumber=' . $order->get_billing_phone() .
            '&auth=' . ($this->payment_gateways['upfw']->capture === 'yes' ? 'false' : 'true') .
            '&amount=' . $money->getAmount() .
            '&currency=' . $money->getCurrency() .
            '&metadata=' . json_encode($metatag) .
            '&successRedirectUrl=' . urlencode($this->payment_gateways['upfw']->get_return_url($order)) .
            '&failureRedirectUrl=' . urlencode($this->payment_gateways['upfw']->get_return_url($order)) .
            '&pendingRedirectUrl=' . urlencode($this->payment_gateways['upfw']->get_return_url($order));

        $this->assertEquals("success", $result['result'], 'Result does not match.');
        $this->assertEquals($expectedRedirectUrl, $result['redirect'], 'Redirect URL does not match.');
    }

    public function test_process_payment()
    {
        // Scenario 1: no univapay charge token
        $this->payment_gateways['upfw']->capture = 'no';
        $_POST['univapay_optional'] = "false";

        $order1 = $this->initiate_mock_order($this->initiate_mock_product());
        $result1 = $this->payment_gateways['upfw']->process_payment($order1->get_id());

        $this->assertNull($result1);
        $error_messages = array_column(wc_get_notices('error'), 'notice');
        $this->assertContains('決済エラーサイト管理者にお問い合わせください。', $error_messages);

        // Scenario 2: capture is 'no'
        $this->payment_gateways['upfw']->capture = 'no';
        $_POST['univapay_optional'] = "false";
        $_POST['univapay_charge_id'] = $this->faker->word;

        $order2 = $this->initiate_mock_order($this->initiate_mock_product());
        $result2 = $this->payment_gateways['upfw']->process_payment($order2->get_id());

        $result_order2 = wc_get_order($order2->get_id());
        $result_order2_notes = wc_get_order_notes(['order_id' => $order2->get_id()]);

        $this->assertEquals('success', $result2['result'], 'Payment processing did not return success.');
        $this->assertStringContainsString('order-received=' . $order2->get_id(), $result2['redirect'], 'Redirect URL does not contain order-received.');
        $this->assertStringContainsString('key=' . $order2->get_order_key(), $result2['redirect'], 'Redirect URL does not contain key.');
        $this->assertEquals($this->payment_gateways['upfw']->status, $result_order2->get_status(), 'Order status does not match the expected status.');
        $this->assertContains('UnivaPayでのオーソリが完了いたしました。', array_column($result_order2_notes, 'content'), 'Order note does not contain expected authorization message.');

        // Scenario 3: capture is 'yes'
        $this->payment_gateways['upfw']->capture = 'yes';
        $_POST['univapay_optional'] = "false";
        $_POST['univapay_charge_id'] = $this->faker->word;

        $order3 = $this->initiate_mock_order($this->initiate_mock_product());
        $result3 = $this->payment_gateways['upfw']->process_payment($order3->get_id());

        $result_order3 = wc_get_order($order3->get_id());
        $result_order3_notes = wc_get_order_notes(['order_id' => $order3->get_id()]);

        $this->assertEquals('success', $result3['result'], 'Payment processing did not return success.');
        $this->assertStringContainsString('order-received=' . $order3->get_id(), $result3['redirect'], 'Redirect URL does not contain order-received.');
        $this->assertStringContainsString('key=' . $order3->get_order_key(), $result3['redirect'], 'Redirect URL does not contain key.');
        // when capture is 'yes', the order status should be 'processing'
        $this->assertEquals('processing', $result_order3->get_status(), 'Order status does not match the expected status.');
        $this->assertContains('UnivaPayでの支払が完了いたしました。', array_column($result_order3_notes, 'content'), 'Order note does not contain expected payment completion message.');
    }
}
