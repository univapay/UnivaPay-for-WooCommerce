<?php

if (! defined('ABSPATH')) {
    exit;
}

use Money\Money;
use Money\Currency;
use Univapay\Resources\Authentication\AppJWT;
use Univapay\Resources\Charge;
use Univapay\UnivapayClient;
use Univapay\UnivapayClientOptions;

class WC_Univapay_Gateway extends WC_Payment_Gateway
{
    /**
    * @var string
    */
    protected $widget;

    /**
    * @var string
    */
    protected $api;

    /**
    * @var string
    */
    protected $token;

    /**
    * @var string
    */
    protected $secret;

    /**
    * @var string (yes|no)
    */
    protected $capture;

    /**
    * @var string
    */
    protected $status;

    /**
    * @var string
    */
    protected $formurl;

    /**
     * @var AppJWT
     */
    protected $app_jwt;

    /**
     * @var UnivapayClient
     */
    protected $univapay_client;

    /**
     * @var UnivapayClientOptions
     */
    protected $univapay_client_options;

    public function __get($name)
    {
        if (property_exists($this, $name)) {
            return $this->$name;
        }
        throw new Exception("Property $name does not exist");
    }

    public function __set($name, $value)
    {
        if (property_exists($this, $name)) {
            $this->$name = $value;
            return;
        }
        throw new Exception("Property $name does not exist");
    }

    /**
    * Class constructor
    */
    public function __construct()
    {
        $this->id = 'upfw'; // payment gateway plugin ID
        $this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
        $this->has_fields = true; // in case you need a custom credit card form
        $this->method_title = 'Univapay Gateway';
        $this->method_description = __('UnivaPayで様々な決済手段を提供します', 'upfw'); // will be displayed on the options page
        // Method with all the options fields
        $this->init_form_fields();
        // Load the settings.
        $this->init_settings();
        $this->title = $this->get_option('title');
        $this->description = $this->get_option('description');
        $this->enabled = $this->get_option('enabled');
        $this->widget = $this->get_option('widget');
        $this->api = $this->get_option('api');
        $this->token = $this->get_option('token');
        $this->secret = $this->get_option('secret');
        $this->capture = $this->get_option('capture');
        $this->status = $this->get_option('status');
        $this->formurl = $this->get_option('formurl');
        $this->app_jwt = null;
        $this->univapay_client = null;
        $this->univapay_client_options = new UnivapayClientOptions($this->api);

        // This action hook saves the settings
        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ));

        // These action hook only runs on legacy checkout page
        // These action will align the behavior with block checkout page
        // Note: these actions will not run on block checkout page, ref: https://woocommerce.com/document/managing-orders/order-statuses/#draft-order-status
        add_action('woocommerce_before_checkout_form', array($this, 'create_draft_order_on_checkout'));
        add_action('woocommerce_checkout_create_order', array($this, 'use_draft_order_if_exists'));

        // TODO: only enqueue scripts on neccessary pages (e.g: checkout, myaccount-oders)
        add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));
        // To keep cart session alive for failed payment split into 2 actions
        // 1. process_redirect_payment: validate is charge valid and process to thank you page
        // 2. process_order_completion: only process the order completion
        add_action('template_redirect', array($this, 'process_redirect_payment'));
        add_action('woocommerce_thankyou', array($this, 'process_order_completion'));

        add_action('rest_api_init', array($this, 'register_get_order_session'));

        // Display charge id in order details
        // TODO: fix meta box later and see what we can do with this
        add_action('woocommerce_admin_order_data_after_order_details', function ($order) {
            $order_id = method_exists($order, 'get_id') ? $order->get_id() : $order->id;
            $univapay_charge_id = get_post_meta($order_id, 'univapay_charge_id', true);
            if ($univapay_charge_id) {
                echo '<div class="form-field form-field-wide">';
                echo '<p><strong>' . __('課金ID') . ':</strong> ' . $univapay_charge_id . '</p>';
                echo '</div>';
            }
        });
    }

    public function register_get_order_session()
    {
        register_rest_route('univapay/v1', '/order-session', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_order_session'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_order_session()
    {
        if (!WC()->session) {
            return new WP_REST_Response(['error' => 'No session available'], 400);
        }

        // legacy checkout
        $order_id = WC()->session->get(WC_Univapay_Constants::ORDER_AWAITING_PAYMENT) ?
            WC()->session->get(WC_Univapay_Constants::ORDER_AWAITING_PAYMENT) : WC()->session->get(WC_Univapay_Constants::SESSION_ORDER_DRAFT_ID);

        // block checkout
        if (is_null($order_id) && isset(WC()->session)) {
            $order_id = isset(WC()->session->order_awaiting_payment) ?
                absint(WC()->session->order_awaiting_payment) : absint(WC()->session->get('store_api_draft_order', 0));
        }

        return new WP_REST_Response(['order_id' => $order_id], 200);
    }

    /**
    * Plugin options, we deal with it in Step 3 too
    */
    public function init_form_fields()
    {
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
            'status' => array(
                'title'       => __('オーソリ時のステータス', 'upfw'),
                'label'       => 'オーソリ完了後作成される注文データのステータス',
                'type'        => 'select',
                'description' => '',
                'default'     => 'on-hold',
                'options'     => array(
                    'on-hold' => '保留',
                    'processing' => '処理中',
                    'pending-payment' => '支払待ち'
                )
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
     * Get an order from session, update it with cart items
     * @param int $order_id
     * @param WC_Cart $cart
     * @return WC_Order|null
     */
    private function get_and_update_order_from_session($order_id, $cart)
    {
        $order = wc_get_order($order_id);
        if (!$order) {
            return null;
        }
        foreach ($order->get_items() as $item_id => $item) {
            $order->remove_item($item_id);
        }
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            $order->add_product($cart_item['data'], $cart_item['quantity']);
        }
        $order->calculate_totals();
        $order->save();
        return $order;
    }

    /**
     * Create draft order on checkout
     */
    public function create_draft_order_on_checkout()
    {
        $order_id = WC()->session->get(WC_Univapay_Constants::ORDER_AWAITING_PAYMENT);
        $cart = WC()->cart;
        if ($order_id) {
            $existing_order = $this->get_and_update_order_from_session($order_id, WC()->cart);
            if ($existing_order) {
                return;
            }
        }

        $existing_draft_order_id = WC()->session->get(WC_Univapay_Constants::SESSION_ORDER_DRAFT_ID);
        if ($existing_draft_order_id) {
            $existing_order = $this->get_and_update_order_from_session($existing_draft_order_id, WC()->cart);
            if ($existing_order && $existing_order->has_status(WC_Univapay_Constants::CHECKOUT_DRAFT_STATUS)) {
                return;
            }
        }

        // Create a new draft order
        $order = wc_create_order();
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            $order->add_product($cart_item['data'], $cart_item['quantity']);
        }
        $order->set_status(WC_Univapay_Constants::CHECKOUT_DRAFT_STATUS);
        $order->save();

        // Store the draft order ID in the session
        WC()->session->set(WC_Univapay_Constants::SESSION_ORDER_DRAFT_ID, $order->get_id());
    }

    /**
     * Use draft order if exists
     * @param WC_Order $order
     */
    function use_draft_order_if_exists($order)
    {
        $draft_order_id = WC()->session->get(WC_Univapay_Constants::SESSION_ORDER_DRAFT_ID);
        if ($draft_order_id) {
            $existing_order = wc_get_order($draft_order_id);
            if ($existing_order && $existing_order->has_status(WC_Univapay_Constants::CHECKOUT_DRAFT_STATUS)) {
                // For legacy checkout, default ID=0 which will create a new order
                $order->set_id($draft_order_id);
                $order->set_status('pending-payment');
            }
        }
    }

    // enqueue script and style sheet
    // TODO: fix this stuff after rendering only for necessary pages
    public function payment_scripts()
    {
        // need JavaScript to process a token only on cart/checkout pages
        if (! is_cart() && ! is_checkout() && ! isset($_GET['pay_for_order'])) {
            return;
        }
        // if our payment gateway is disabled, we do not have to enqueue JS too
        if ('no' === $this->enabled) {
            return;
        }
        // no reason to enqueue JavaScript if Shop id are not set
        if (empty($this->token)) {
            return;
        }

        $univapay_asset_file = include(plugin_dir_path(__DIR__) . 'dist/univapay.bundle.asset.php');

        // payment processor JavaScript that allows to obtain a token
        wp_enqueue_script('univapay_checkout', $this->widget . '/client/checkout.js', array(), null, true);
        // and this is our custom JS in your plugin directory that works with token.js
        wp_enqueue_script(
            'univapay_woocommerce',
            plugin_dir_url(__DIR__) . 'dist/univapay.bundle.js',
            array('jquery', 'univapay_checkout'),
            $univapay_asset_file['version'],
            true
        );

        // legacy checkout
        $order_id = WC()->session->get(WC_Univapay_Constants::ORDER_AWAITING_PAYMENT) ?
            WC()->session->get(WC_Univapay_Constants::ORDER_AWAITING_PAYMENT) : WC()->session->get(WC_Univapay_Constants::SESSION_ORDER_DRAFT_ID);

        // block checkout
        if (is_null($order_id) && isset(WC()->session)) {
            $order_id = isset(WC()->session->order_awaiting_payment) ?
                absint(WC()->session->order_awaiting_payment) : absint(WC()->session->get('store_api_draft_order', 0));
        }

        wp_localize_script('univapay_woocommerce', 'univapay_params', array(
            'app_id' => $this->token,
            'formurl' => $this->formurl,
            'total' =>  WC()->cart->total,
            'capture' => ($this->capture === 'yes') ? 'true' : 'false',
            'currency' => strtolower(get_woocommerce_currency()),
            'order_id' => $order_id,
        ));
    }

    /*
    * Fields validation
    */
    public function validate_fields()
    {
    }

    /*
    * We're processing the payments here, everything about
    */
    public function process_payment($order_id)
    {
        $order = wc_get_order($order_id);
        $capture = $this->capture === 'yes';

        $money = new Money($order->get_data()["total"], new Currency($order->get_data()["currency"]));
        if (isset($_POST['univapay_optional']) && $_POST['univapay_optional'] === 'true') {
            return array(
                'result' => 'success',
                'redirect' => $this->formurl .
                    '?appId=' . $this->token .
                    '&emailAddress=' . $order->get_data()["billing"]["email"] .
                    '&name=' . $order->get_data()["billing"]["first_name"] . ' ' . $order->get_data()["billing"]["last_name"] .
                    '&phoneNumber=' . $order->get_data()["billing"]["phone"] .
                    '&auth=' . ($capture ? 'false' : 'true') . # auth: true = authorize, false = capture
                    '&amount=' . $money->getAmount() .
                    '&currency=' . $money->getCurrency() .
                    '&order_id=' . $order_id .
                    '&successRedirectUrl=' . urlencode($this->get_return_url($order)) .
                    '&failureRedirectUrl=' . urlencode($this->get_return_url($order)) .
                    '&pendingRedirectUrl=' . urlencode($this->get_return_url($order))
            );
        }

        if (!isset($_POST["univapayChargeId"]) && !isset($_POST["univapay_charge_id"])) {
            wc_add_notice(__('決済エラーサイト管理者にお問い合わせください。', 'upfw'), 'error');
            return;
        }
        $chargeId = isset($_POST["univapayChargeId"]) ? $_POST["univapayChargeId"] : $_POST["univapay_charge_id"];

        // Redirect to the thank you page
        return array(
            'result' => 'success',
            'redirect' => add_query_arg('univapayChargeId', $chargeId, $this->get_return_url($order))
        );
    }

    /**
     * Check if charge token is valid
     * @param Charge $charge
     * @param WC_Order $order
     * @return bool
     */
    public function is_charge_valid($charge, $order)
    {
        if ($charge->error) {
            return false;
        }
        // TODO: fix this later
        // if (!isset($charge->metadata['order_id'])) {
        //     return false;
        // }
        // if ((int) $charge->metadata['order_id'] !== $order->get_id()) {
        //     return false;
        // }
        return true;
    }

    /**
     * Process redirect payment
     * Validate charge and process order
     */
    public function process_redirect_payment()
    {
        if (getenv('WP_ENV') !== 'test') {
            // Default environment
            if (! is_order_received_page() || empty($_GET['univapayChargeId'])) {
                return;
            }
        } else {
            // Test environment
            if (empty($_GET['univapayChargeId'])) {
                return;
            }
        }

        try {
            global $wp;
            $order_id = absint($wp->query_vars['order-received']);

            $order = wc_get_order($order_id);
            $token = $this->app_jwt ? $this->app_jwt::createToken($this->token, $this->secret) : AppJWT::createToken($this->token, $this->secret);
            if ($this->univapay_client === null) {
                $this->univapay_client = new UnivapayClient($token, $this->univapay_client_options);
            }
            $charge = $this->univapay_client->getCharge($token->storeId, $_GET['univapayChargeId']);

            if (!$this->is_charge_valid($charge, $order)) {
                // NOTE: notice does not show up on block checkout page
                wc_add_notice(__('決済エラー入力内容を確認してください', 'upfw'), 'error');
                wp_safe_redirect(wc_get_cart_url());
                exit;
            }
            // TODO: add validation so order status does not get overwritten, when page is refreshed

            $capture = $this->capture === 'yes';
            $paymentType = $this->univapay_client->getTransactionToken($charge->transactionTokenId)->paymentType->getValue();
            global $woocommerce;
            if ($capture || !in_array($paymentType, ['card', 'paidy'])) {
                $order->payment_complete();
                // add comment for order can see admin panel
                $order->add_order_note(__('UnivaPayでの支払が完了いたしました。', 'upfw'), true);
            } else {
                $order->update_status($this->status, __('キャプチャ待ちです', 'upfw'));
                // add comment for order can see admin panel
                $order->add_order_note(__('UnivaPayでのオーソリが完了いたしました。', 'upfw'), true);
            }
            // save charge id
            update_post_meta($order_id, 'univapay_charge_id', $charge->id);
        } catch (\Exception $e) {
            wc_add_notice(__('決済エラーサイト管理者にお問合せください', 'upfw'), 'error');
            wp_safe_redirect(wc_get_cart_url());
            exit;
        }
    }

    /**
     * Process order completion
     * WooCommerce thank you page, cart session already been cleared
     */
    public function process_order_completion()
    {
        // clear session
        // legacy checkout, our custom session clean up
        WC()->session->set(WC_Univapay_Constants::SESSION_ORDER_DRAFT_ID, null);
        // block checkout, WooCommerce seems to keep this session even after payment_complete
        WC()->session->set('store_api_draft_order', null);
    }

    /*
    * In case you need a webhook, like PayPal IPN etc
    */
    public function webhook()
    {
    }
}
