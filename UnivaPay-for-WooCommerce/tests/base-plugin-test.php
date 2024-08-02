<?php
/**
 * Class BasePluginTest
 *
 * @package UnivaPay_For_WooCommerce
 */

/**
 * Base test case for plugin tests.
 */
class BasePluginTest extends WP_UnitTestCase {
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
     * Set up the test environment.
     */
    public function setUp(): void {
        parent::setUp();
        error_reporting(E_ALL);
    }
}
