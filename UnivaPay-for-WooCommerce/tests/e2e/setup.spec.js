import { Selector } from 'testcafe';
import { admin } from './helper/role.js';

fixture `Check E2E Test Environment`

test('Test Environment should be Ready', async t => {
    await t
        .useRole(admin)
        .navigateTo('http://localhost:3080/wp-admin/admin.php?page=wc-settings&tab=checkout&section=upfw')
        .expect(Selector('#woocommerce_upfw_enabled').checked).eql(true)
        .expect(Selector('#woocommerce_upfw_widget').value).eql("https://widget.gyro-n.money")
        .expect(Selector('#woocommerce_upfw_api').value).eql("https://api.gyro-n.money")
        .expect(Selector('#woocommerce_upfw_formurl').value).contains("https://checkout.gyro-n.money")
        .navigateTo('http://localhost:3080/wp-admin/edit.php?post_type=product')
        .expect(Selector('#post-10 td').withText('Test Product 1').exists).ok()
        .expect(Selector('#post-10 td').withText('test-product-1').exists).ok()
        .expect(Selector('#post-10 td').withText('¥1,000.00').exists).ok()
        .expect(Selector('#post-11 td').withText('Test Product 2').exists).ok()
        .expect(Selector('#post-11 td').withText('test-product-2').exists).ok()
        .expect(Selector('#post-11 td').withText('¥2,000.00').exists).ok()
        .navigateTo('http://localhost:3080/wp-admin/edit.php?post_type=shop_coupon')
        .expect(Selector('#post-12 td').withText('testcoupon').exists).ok()
        .expect(Selector('#post-12 td').withText('10').exists).ok()
});
