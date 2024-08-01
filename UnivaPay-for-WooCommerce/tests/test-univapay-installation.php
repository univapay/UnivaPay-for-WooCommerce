<?php
/**
 * Class TestUnivapayInstallation
 *
 * @package UnivaPay_For_WooCommerce
 */

/**
 * Plugin installation test case.
 */
class TestUnivapayInstallation extends BasePluginTest {
    /**
     * Test plugin installation.
     */
    public function test_plugin_installation() {
        activate_plugin($this->plugin_slug);
        $this->assertTrue(is_plugin_active($this->plugin_slug));
    }

    /**
     * Test plugin uninstallation.
     */
    public function test_plugin_uninstallation() {
        deactivate_plugins([$this->plugin_slug]);
        $this->assertFalse(is_plugin_active($this->plugin_slug));
    }
}