<?php

if (! defined('ABSPATH')) {
    exit;
}

use Money\Money;
use Money\Currency;

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

        // This action hook saves the settings
        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ));
        // enqueue script and style sheet
        add_action('wp_enqueue_scripts', array( $this, 'payment_scripts' ));
        // You can also register a webhook here
        // add_action( 'woocommerce_api_{webhook name}', array( $this, 'webhook' ) );
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

    // enqueue script and style sheet
    public function payment_scripts()
    {
        $univapay_asset_file = include(plugin_dir_path(__DIR__) . 'dist/univapay.bundle.asset.php');

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
        // have to use Shop id to obtain a token
        // TODO: confirm if we are using this order in specific case, as this will always be null
        $order = wc_get_order(get_query_var('order-pay'));
        if ($order) {
            $order = $order->get_data();
        }

        wp_localize_script('univapay_woocommerce', 'univapay_params', array(
            'token' => $this->token,
            'formurl' => $this->formurl,
            'total' => WC()->cart->total,
            'capture' => ($this->capture === 'yes') ? 'true' : 'false',
            'currency' => strtolower(get_woocommerce_currency()),
            'email' => $order ? $order["billing"]["email"] : null
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

        global $woocommerce;
        if ($capture) {
            $order->payment_complete();
            // add comment for order can see admin panel
            $order->add_order_note(__('UnivaPayでの支払が完了いたしました。', 'upfw'), true);
        } else {
            $order->update_status($this->status, __('キャプチャ待ちです', 'upfw'));
            // add comment for order can see admin panel
            $order->add_order_note(__('UnivaPayでのオーソリが完了いたしました。', 'upfw'), true);
        }
        // save charge id
        update_post_meta($order_id, 'univapayChargeId', $chargeId);
        // Empty cart
        $woocommerce->cart->empty_cart();
        // Redirect to the thank you page
        return array(
            'result' => 'success',
            'redirect' => $this->get_return_url($order)
        );
    }

    /*
    * In case you need a webhook, like PayPal IPN etc
    */
    public function webhook()
    {
    }
}
