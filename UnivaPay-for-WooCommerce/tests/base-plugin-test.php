<?php

namespace Univapay\WooCommerce\Tests;

use Faker\Factory;
use Mockery;
use Univapay\UnivapayClient;
use Univapay\Resources\Charge;
use WC_Product_Simple;
use WC_Univapay_Gateway;
use WP_UnitTestCase;

/**
 * Class BasePluginTest
 *
 * @package UnivaPay_For_WooCommerce
 */

/**
 * Base test case for plugin tests.
 */
class BasePluginTest extends WP_UnitTestCase
{
    /**
     * Plugin path.
     *
     * @var string
     */
    protected $plugin_slug = 'UnivaPay-for-WooCommerce/UnivaPay-for-WooCommerce.php';

    /**
     * WooCommerce plugin path.
     *
     * @var string
     */
    protected $woocommerce_slug = 'woocommerce/woocommerce.php';

    /**
     * @var Faker\Generator
     */
    protected $faker;

    /**
     * @var WC_Univapay_Gateway
     */
    protected $payment_gateways;

    /**
     * Initializes the payment gateways with mock data.
     *
     * @return array The initialized payment gateways.
     */
    public function initiate_mock_gateways()
    {
        $mock_charge = Mockery::mock(Charge::class);
        $mock_charge->shouldReceive('awaitResult')
            ->andReturn((object) [
                'error' => false,
                'id' => 'test_charge_id'
            ]);

        $mock_app_jwt = Mockery::mock('alias:AppJWT');
        $mock_app_jwt->shouldReceive('createToken')
            ->andReturn((object) [
                'storeId' => 'mock_store_id',
                'token' => 'mock_token'
            ]);

        $mock_univapay_client = Mockery::mock(UnivapayClient::class);
        $mock_univapay_client->shouldReceive('createCharge')
            ->andReturn($mock_charge);
        $mock_univapay_client->shouldReceive('getCharge')
            ->andReturn($mock_charge);

        $payment_gateways = WC()->payment_gateways()->payment_gateways();
        $payment_gateways['upfw'] = new WC_Univapay_Gateway();
        $payment_gateways['upfw']->appJWT = $mock_app_jwt;
        $payment_gateways['upfw']->univapayClient = $mock_univapay_client;
        $payment_gateways['upfw']->token = "mock_app_token";
        $payment_gateways['upfw']->capture = 'yes';
        $payment_gateways['upfw']->formurl = 'http://test.localhost';
        $payment_gateways['upfw']->enabled = 'yes';
        $payment_gateways['upfw']->status = 'processing';

        return $payment_gateways;
    }

    /**
     * Initiates a mock product.
     *
     * @return WC_Product_Simple The initiated mock product.
     */
    public function initiate_mock_product()
    {
        $product = new WC_Product_Simple();
        $product->set_name($this->faker->word);
        $product->set_price($this->faker->numberBetween(500, 2000));
        $product->set_regular_price($product->get_price());
        $product->save();
        return $product;
    }

    /**
     * Initiates a mock order.
     *
     * @param WC_Product_Simple $product The product to be added to the order.
     * @return WC_Order The initiated mock order.
     */
    public function initiate_mock_order($product)
    {
        $order = wc_create_order();
        $order->add_product(wc_get_product($product->get_id()), 1);
        $order->set_payment_method('upfw');
        $order->calculate_totals();
        $order->set_billing_first_name($this->faker->firstName);
        $order->set_billing_last_name($this->faker->lastName);
        $order->set_billing_email($this->faker->email);
        $order->set_billing_address_1($this->faker->streetAddress);
        $order->set_billing_city($this->faker->city);
        $order->set_billing_postcode($this->faker->postcode);
        $order->set_billing_country('JP');
        $order->set_currency('JPY');
        $order->save();
        return $order;
    }

    /**
     * Set up the test environment.
     */
    public function setUp(): void
    {
        parent::setUp();
        error_reporting(E_ALL);
        $this->faker = Factory::create();
        $this->payment_gateways = $this->initiate_mock_gateways();
    }
}
