<?php

/**
 * PHPUnit bootstrap file.
 *
 * @package UnivaPay_For_WooCommerce
 */

$_tests_dir = getenv('WP_TESTS_DIR');
if (! $_tests_dir) {
    $_tests_dir = rtrim(sys_get_temp_dir(), '/\\') . '/wordpress-tests-lib';
}

$_phpunit_polyfills_path = getenv('WP_TESTS_PHPUNIT_POLYFILLS_PATH');
if (false !== $_phpunit_polyfills_path) {
    define('WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path);
}

if (! file_exists("{$_tests_dir}/includes/functions.php")) {
    echo "Could not find {$_tests_dir}/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit(1);
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";

$_wp_tests_plugins_dir = "/tmp/wordpress/wp-content/plugins/";

function _manually_load_plugin($plugin_dir)
{
    require_once $plugin_dir . '/UnivaPay-for-WooCommerce/UnivaPay-for-WooCommerce.php';
    require_once $plugin_dir . '/woocommerce/woocommerce.php';
}

tests_add_filter('muplugins_loaded', function () use ($_wp_tests_plugins_dir) {
    _manually_load_plugin($_wp_tests_plugins_dir);
});

tests_add_filter('setup_theme', function () {
    // Hook into 'setup_theme' to run the WooCommerce installation
    // force WooCommerce to install and create the necessary tables
    WC_Install::install();
});

// Start up the WP testing environment.
require_once $_tests_dir . '/includes/bootstrap.php';

// Helper
require_once $_wp_tests_plugins_dir . 'UnivaPay-for-WooCommerce/tests/base-plugin-test.php';
