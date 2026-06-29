<?php

namespace Univapay\WooCommerce\Tests;

use Mockery;
use Mockery\MockInterface;
use Money\Money;
use Money\Currency;
use Univapay\Enums\ChargeStatus;
use Univapay\Enums\PaymentType;
use Univapay\Resources\Authentication\AppJWT;
use Univapay\UnivapayClient;

/**
 * Test for the payment processing
 */
class TestPaymentProcessing extends BasePluginTest {
	/**
	 * Test that the redirect URL is generated correctly when processing a payment.
	 */
	public function test_redirect_url_is_generated_correctly() {
		$order                      = $this->initiate_mock_order( $this->initiate_mock_product() );
		$_POST['univapay_optional'] = 'true';
		$result                     = $this->payment_gateways['upfw']->process_payment( $order->get_id() );
		$money                      = new Money( $order->get_data()['total'], new Currency( $order->get_data()['currency'] ) );

		$expected_redirect_url = $this->payment_gateways['upfw']->formurl .
			'?appId=' . $this->payment_gateways['upfw']->token .
			'&emailAddress=' . $order->get_billing_email() .
			'&name=' . $order->get_billing_first_name() . ' ' . $order->get_billing_last_name() .
			'&phoneNumber=' . $order->get_billing_phone() .
			'&auth=' . ( 'yes' === $this->payment_gateways['upfw']->capture ? 'false' : 'true' ) .
			'&amount=' . $money->getAmount() .
			'&currency=' . $money->getCurrency() .
			'&order_id=' . $order->get_id() .
			'&successRedirectUrl=' . rawurlencode( $this->payment_gateways['upfw']->get_return_url( $order ) ) .
			'&failureRedirectUrl=' . rawurlencode( $this->payment_gateways['upfw']->get_return_url( $order ) ) .
			'&pendingRedirectUrl=' . rawurlencode( $this->payment_gateways['upfw']->get_return_url( $order ) );

		$this->assertEquals( 'success', $result['result'], 'Result does not match.' );
		$this->assertEquals( $expected_redirect_url, $result['redirect'], 'Redirect URL does not match.' );
	}

	/**
	 * Initiates a mock charge
	 *
	 * @param \Faker\Generator $faker The faker instance for generating random data.
	 * @param WC_Order         $order The order to be used in the mock charge.
	 * @param ChargeStatus     $expected_charge_status The expected status of the charge.
	 * @return object The initiated mock charge.
	 */
	private function initiate_mock_charge( $faker, $order, $expected_charge_status ): object {
		return new class($faker, $order, $expected_charge_status) {
			/**
			 * @var string The ID of the charge.
			 */
			public string $id;

			/**
			 * @var array The metadata associated with the charge.
			 */
			public array $metadata;

			/**
			 * @var string The ID of the transaction token.
			 */
			public string $transactionTokenId; // phpcs:ignore

			/**
			 * @var ChargeStatus The status of the charge.
			 */
			public ChargeStatus $status;

			/**
			 * @var bool Indicates if there was an error with the charge.
			 */
			public bool $error;

			/**
			 * Constructor for the mock charge.
			 *
			 * @param \Faker\Generator $faker The faker instance for generating random data.
			 * @param WC_Order         $order The order to be used in the mock charge.
			 * @param ChargeStatus     $expected_charge_status The expected status of the charge.
			 */
			public function __construct( $faker, $order, $expected_charge_status ) {
				$this->id                 = $faker->uuid;
				$this->metadata           = array( 'order_id' => $order->get_id() );
				$this->transactionTokenId = $faker->uuid;
				$this->status             = $expected_charge_status;
				$this->error              = false;
			}

			/**
			 * Mock method to simulate patching the charge.
			 *
			 * @param array $data The data to patch the charge with.
			 */
			public function patch( $data ) {
				return null;
			}
		};
	}

	/**
	 * Initiates a mock AppJWT.
	 *
	 * @return MockInterface The initiated mock AppJWT.
	 */
	private function initiate_mock_app_jwt(): MockInterface {
		return Mockery::mock( 'alias:' . AppJWT::class )
			->shouldReceive( 'createToken' )
			->andReturn(
				(object) array(
					'storeId' => $this->faker->uuid,
				)
			)
			->getMock();
	}

	/**
	 * Initiates a mock client.
	 *
	 * @param object $mock_charge The mock charge to be returned by the client.
	 * @return MockInterface The initiated mock client.
	 */
	private function initiate_mock_client( $mock_charge ): MockInterface {
		$mock_transaction_token              = Mockery::mock();
		$mock_transaction_token->paymentType = PaymentType::CARD();

		$mock_client = Mockery::mock( UnivapayClient::class );
		$mock_client->shouldReceive( 'getCharge' )->andReturn( $mock_charge );
		$mock_client->shouldReceive( 'getTransactionToken' )->andReturn( $mock_transaction_token );

		return $mock_client;
	}

	/**
	 * Test that the payment processing validation works correctly.
	 */
	public function test_process_payment_validation() {
		$this->payment_gateways['upfw']->capture = 'no';
		$_POST['univapay_optional']              = 'false';

		$mock_order1 = $this->initiate_mock_order( $this->initiate_mock_product() );
		$result1     = $this->payment_gateways['upfw']->process_payment( $mock_order1->get_id() );

		$this->assertNull( $result1 );
		$error_messages = array_column( wc_get_notices( 'error' ), 'notice' );
		$this->assertContains( '決済エラーサイト管理者にお問い合わせください。', $error_messages );
	}

	/**
	 * Data provider for test_process_order_payment.
	 */
	public function order_payment_data_provider() {
		// Note: WooCommerce order status list.
		// pending, processing, on-hold, completed, cancelled, refunded, failed.
		return array(
			// capture, chage status, expected order status, expected order note.
			array( 'no', ChargeStatus::AUTHORIZED(), 'pending', 'UnivaPayでのオーソリが完了いたしました。' ),
			array( 'yes', ChargeStatus::SUCCESSFUL(), 'processing', 'UnivaPayでの支払が完了いたしました。' ),
		);
	}

	/**
	 * @dataProvider order_payment_data_provider
	 * @param string       $capture capture setting for the payment gateway ('yes' or 'no').
	 * @param ChargeStatus $expected_charge_status expected charge status after processing the payment.
	 * @param string       $expected_status expected order status after processing the payment.
	 * @param string       $expected_note expected order note after processing the payment.
	 */
	public function test_process_order_payment( $capture, $expected_charge_status, $expected_status, $expected_note ) {
		$this->payment_gateways['upfw']->capture = $capture;
		$_POST['univapay_optional']              = 'false';
		$mock_charge_token                       = $this->faker->word;
		$_POST['univapay_charge_id']             = $mock_charge_token;

		$mock_order = $this->initiate_mock_order( $this->initiate_mock_product() );
		$result     = $this->payment_gateways['upfw']->process_payment( $mock_order->get_id() );

		$this->assertEquals( 'success', $result['result'], 'Payment processing did not return success.' );
		$this->assertStringContainsString( 'order-received=' . $mock_order->get_id(), $result['redirect'], 'Redirect URL does not contain order-received.' );
		$this->assertStringContainsString( 'key=' . $mock_order->get_order_key(), $result['redirect'], 'Redirect URL does not contain key.' );

		// simulate the order completion process
		WC()->session->set( 'order_awaiting_payment', $mock_order->get_id() );
		$_GET['univapayChargeId'] = $mock_charge_token;
		global $wp;
		$wp->query_vars['order-received']                = $mock_order->get_id();
		$mock_charge                                     = $this->initiate_mock_charge( $this->faker, $mock_order, $expected_charge_status );
		$mock_client                                     = $this->initiate_mock_client( $mock_charge );
		$mock_app_jwt                                    = $this->initiate_mock_app_jwt();
		$this->payment_gateways['upfw']->app_jwt         = $mock_app_jwt;
		$this->payment_gateways['upfw']->univapay_client = $mock_client;
		$this->payment_gateways['upfw']->process_redirect_payment();
		$result_order_notes = wc_get_order_notes( array( 'order_id' => $mock_order->get_id() ) );

		$result_order = wc_get_order( $mock_order->get_id() );
		$this->assertEquals( $mock_charge->id, get_post_meta( $result_order->get_id(), 'univapay_charge_id', true ), 'Charge ID should be saved.' );
		$this->assertEquals( $expected_status, $result_order->get_status(), 'Order status does not match the expected status.' );
		$this->assertContains( $expected_note, array_column( $result_order_notes, 'content' ), 'Order note does not contain expected status change message.' );
	}
}
