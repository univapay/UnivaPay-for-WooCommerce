<?php
/**
 * WordPress PHPUnit configuration file.
 */

// Path to the WordPress codebase you'd like to test.
define('ABSPATH', '/tmp/wordpress/');

// Test with multisite enabled.
define('WP_TESTS_MULTISITE', false);

// Force known bugs to be run.
define('WP_TESTS_FORCE_KNOWN_BUGS', false);

// Test with WordPress debug mode on.
define('WP_DEBUG', true);

// ** DB settings ** //
// TODO: change locally for easy setup on CI
define('DB_NAME', 'wordpress_test');
define('DB_USER', 'root');
define('DB_PASSWORD', 'wordpress');
define('DB_HOST', 'wp-db:3306');

// ** Test suite settings ** //
define('WP_TESTS_DOMAIN', 'example.org');
define('WP_TESTS_EMAIL', 'admin@example.org');
define('WP_TESTS_TITLE', 'test');
define('WP_PHP_BINARY', 'php');
define('WPLANG', '');

// Path to the WordPress tests library.
define('WP_TESTS_DIR', '/tmp/wordpress-tests-lib');

// Path to the plugin to be tested.
define('WP_PLUGIN_DIR', '/tmp/wordpress/wp-content/plugins/');

$table_prefix  = 'wptests_';