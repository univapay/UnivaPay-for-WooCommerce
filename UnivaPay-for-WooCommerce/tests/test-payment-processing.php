<?php

namespace Univapay\WooCommerce\Tests;

use Univapay\UnivapayClient;
use Univapay\Resources\Charge;
use WC_Univapay_Gateway;
use WC_Product_Simple;
use Mockery;

class TestPaymentProcessing extends BasePluginTest
{
    /**
     * @var WC_Product_Simple
     */
    private $product;

    /**
     * @var WC_Order
     */
    private $order;

    /**
     * @var WC_Univapay_Gateway
     */
    private $payment_gateways;

    public function setUp(): void
    {
        parent::setUp();
        $this->product = $this->initiate_mock_product();
        $this->order = $this->initiate_mock_order($this->product);
        $this->payment_gateways = $this->initiate_mock_gateways();
    }

    /**
     * Initiates a mock product.
     *
     * @return WC_Product_Simple The initiated mock product.
     */
    private function initiate_mock_product()
    {
        $product = new WC_Product_Simple();
        $product->set_name('Test Product');
        $product->set_price(1000);
        $product->set_regular_price(1000);
        $product->set_sku('test-product');
        $product->save();
        return $product;
    }

    /**
     * Initiates a mock order.
     *
     * @param WC_Product_Simple $product The product to be added to the order.
     * @return WC_Order The initiated mock order.
     */
    private function initiate_mock_order($product)
    {
        $order = wc_create_order();
        $order->add_product(wc_get_product($product->get_id()), 1);
        $order->set_payment_method('upfw');
        $order->calculate_totals();
        return $order;
    }

    /**
     * Initializes the payment gateways with mock data.
     *
     * @return array The initialized payment gateways.
     */
    private function initiate_mock_gateways()
    {
        $chargeMock = Mockery::mock(Charge::class);
        $chargeMock->shouldReceive('awaitResult')
            ->andReturn((object) [
                'error' => false,
                'id' => 'test_charge_id'
            ]);

        $appJWTMock = Mockery::mock('alias:AppJWT');
        $appJWTMock->shouldReceive('createToken')
            ->andReturn((object) [
                'storeId' => 'mock_store_id',
                'token' => 'mock_token'
            ]);

        $univapayClientMock = Mockery::mock(UnivapayClient::class);
        $univapayClientMock->shouldReceive('createCharge')
            ->andReturn($chargeMock);
        $univapayClientMock->shouldReceive('getCharge')
            ->andReturn($chargeMock);

        $payment_gateways = WC()->payment_gateways()->payment_gateways();
        $payment_gateways['upfw'] = new WC_Univapay_Gateway();
        $payment_gateways['upfw']->appJWT = $appJWTMock;
        $payment_gateways['upfw']->univapayClient = $univapayClientMock;
        $payment_gateways['upfw']->capture = 'yes';
        $payment_gateways['upfw']->enabled = 'yes';
        $payment_gateways['upfw']->status = 'processing';

        return $payment_gateways;
    }

    public function test_missing_token()
    {
        $result = $this->payment_gateways['upfw']->process_payment($this->order->get_id());
        $this->assertNull($result);
        $error_messages = array_column(wc_get_notices('error'), 'notice');
        $this->assertContains('決済エラーサイト管理者にお問い合わせください。', $error_messages);
    }

    public function test_payment_processing()
    {
        $_POST['univapayTokenId'] = 'mock_token_id';
        $_POST['univapayChargeId'] = 'mock_charge_id';
        $result = $this->payment_gateways['upfw']->process_payment($this->order->get_id());
        $this->assertEquals('success', $result['result'], 'Payment processing did not return success.');
        $this->assertStringContainsString(
            'order-received=' . $this->order->get_id(),
            $result['redirect'],
            'Order received ID does not match.'
        );
        $this->assertStringContainsString(
            'key=' . $this->order->get_order_key(),
            $result['redirect'],
            'Order key does not match.'
        );

        $orderResult = wc_get_order($this->order->get_id());
        $this->assertEquals(
            $this->payment_gateways['upfw']->status,
            $orderResult->get_status(),
            'Order status is not "' . $this->payment_gateways['upfw']->status . '" after payment.'
        );
    }
}
