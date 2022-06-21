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
add_filter( 'woocommerce_payment_gateways', 'univapay_add_gateway_class' );
function univapay_add_gateway_class( $gateways ) {
	$gateways[] = 'WC_Univapay_Gateway';
	return $gateways;
}
/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action( 'plugins_loaded', 'univapay_init_gateway_class' );
function univapay_init_gateway_class() {
    // plugins_loaded時実行
    // order詳細画面にunivapayのステータスを表示する
    function add_custom_boxes() {
        global $post;
        if(get_post_meta($post->ID, '_payment_method')[0] !== 'upfw')
            return;
        add_meta_box( 'univapay_status_box', __( 'UnivaPayステータス' ), 'custom_metabox_content', 'shop_order', 'side', 'default');
    }
    function custom_metabox_content($post) {
        $settings = WC()->payment_gateways->payment_gateways()['upfw'];
        $clientOptions = new UnivapayClientOptions($settings->get_option('api'));
        $token = AppJWT::createToken($settings->get_option('token'), $settings->get_option('secret'));
        $client = new UnivapayClient($token, $clientOptions);
        $charge = $client->getCharge($token->storeId, get_post_meta($post->ID, 'univapay_charge_id')[0]);
        // get ajax
        $data = json_decode(file_get_contents('php://input'), true);
        if(isset($data['univapay_update'])) {
            $order = wc_get_order( $post );
            switch ($data['univapay_update']) {
                case 'capture':
                    $charge->capture();
                    $order->payment_complete();
                    // add comment for order can see admin panel
                    $order->add_order_note( __('UnivaPayでの支払が完了いたしました。', 'upfw'), true );
                    break;
                default:
                    break;
            }
            $order->save();
        }

        echo '<h4>ステータス: '.$charge->status->getValue().'</h4>';
        switch ($charge->status->getValue()) {
            case 'authorized':
                echo '<button type="button" class="button button-primary" onclick="update(event)" value="capture">キャプチャ</button>';
                break;
            default:
                break;
        }
        ?>
            <script>
                update = (e) => {
                    e.preventDefault();
                    e.target.disabled = true;
                    const xhttp = new XMLHttpRequest();
                    xhttp.onload = function() {
                        if(this.status !== 200) {
                            alert('エラーが発生しました。再度お試しください。');
                        }
                        location.reload();
                    }
                    xhttp.open("POST", "", true);
                    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    xhttp.send(JSON.stringify({univapay_update: e.target.value}));
                }
            </script>
        <?php
    }
    add_action('add_meta_boxes', 'add_custom_boxes');
    // for EC form redirect
    function maybe_process_redirect_order() {
        if ( ! is_order_received_page() || empty( $_GET['charge_token'] ) ) {
            return;
        }
        try{
            $order_id = $_GET['order_id'];
            $order = wc_get_order( $order_id );
            $settings = WC()->payment_gateways->payment_gateways()['upfw'];
            $clientOptions = new UnivapayClientOptions($settings->get_option('api'));
            $token = AppJWT::createToken($settings->get_option('token'), $settings->get_option('secret'));
            $client = new UnivapayClient($token, $clientOptions);
            $charge = $client->getCharge($token->storeId, $_GET['charge_token']);
            if($charge->error) {
                wc_add_notice(__('決済エラー入力内容を確認してください', 'upfw').$charge->error["details"], 'error');
                wp_safe_redirect( wc_get_checkout_url() );
                exit;
            }
            global $woocommerce;
            $order->payment_complete();
            // add comment for order can see admin panel
            $order->add_order_note( __('UnivaPayでの支払が完了いたしました。', 'upfw'), true );
            // save charge id
            update_post_meta($order_id, 'univapay_charge_id', $charge->id);
            // Empty cart
            $woocommerce->cart->empty_cart();
        } catch (\Exception $e) {
            wc_add_notice(__('決済エラーサイト管理者にお問合せください', 'upfw'), 'error');
            wp_safe_redirect( wc_get_checkout_url() );
            exit;
        }
    }
    add_action( 'wp', 'maybe_process_redirect_order' );
	class WC_Univapay_Gateway extends WC_Payment_Gateway {
 		/**
 		 * Class constructor
 		 */
 		public function __construct() {
            $this->id = 'upfw'; // payment gateway plugin ID
            $this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
            $this->has_fields = true; // in case you need a custom credit card form
            $this->method_title = 'Univapay Gateway';
            $this->method_description = __('UnivaPayで様々な決済手段を提供します', 'upfw'); // will be displayed on the options page
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
            $this->formurl = $this->get_option( 'formurl' );
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
 		public function init_form_fields() {
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
                    'default'     => __('UnivaPay', 'upfw'),
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
                    'default'     => 'no'
                ),
                'formurl' => array(
                    'title'       => __('フォームURL', 'upfw'),
                    'label'       => 'カード決済以外のフォーム用URL',
                    'type'        => 'text',
                    'description' => '?appIdより前のURLを入力してください。',
                    'default'     => ''
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
                'token' => $this->token,
                'formurl' => $this->formurl
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
            $order = wc_get_order( $order_id );
            $money = new Money($order->data["total"], new Currency($order->data["currency"]));
            if(isset($_POST['univapayOptional']) && $_POST['univapayOptional'] === 'true') {
                return array(
                    'result' => 'success',
                    'redirect' => $this->formurl.'?appId='.$this->token.'&amount='.$money->getAmount().'&currency='.$money->getCurrency()
                );
            }
            if(!isset($_POST['univapayTokenId'])) {
                wc_add_notice(__('決済エラーサイト管理者にお問い合わせください。', 'upfw'), 'error');
                return;
            }
            // charge from charge token
            $clientOptions = new UnivapayClientOptions($this->api);
            $token = AppJWT::createToken($this->token, $this->secret);
            $client = new UnivapayClient($token, $clientOptions);
            $capture = $this->capture === 'yes';
            $charge = $client->createCharge($_POST['univapayTokenId'], $money, $capture)->awaitResult();
            if($charge->error) {
                wc_add_notice(__('決済エラー入力内容を確認してください', 'upfw').$charge->error["details"], 'error');
                return;
            }
            global $woocommerce;
            if($capture) {
                $order->payment_complete();
                // add comment for order can see admin panel
                $order->add_order_note( __('UnivaPayでの支払が完了いたしました。', 'upfw'), true );
            } else {
                $order->update_status('on-hold', __('キャプチャ待ちです', 'upfw'));
                // add comment for order can see admin panel
                $order->add_order_note( __('UnivaPayでのオーソリが完了いたしました。', 'upfw'), true );
            }
            // save charge id
            update_post_meta($order_id, 'univapay_charge_id', $charge->id);
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
