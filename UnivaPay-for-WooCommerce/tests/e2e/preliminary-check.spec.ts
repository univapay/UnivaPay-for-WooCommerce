import { Selector } from 'testcafe'
import { config } from './config'
import { wpAdmin, univapayConsoleUser } from './helper/role'
import wcCoupontListPage from './models/wp/admin/coupon-list'
import wcProductListPage from './models/wp/admin/product-list'
import wcUnivapaySettingPage from './models/wp/admin/univapay-setting'

fixture `Check E2E Test Environment`
    .page `${config.wpUrl}`

test('Test Environment should be Ready', async t => {
    await t
        .useRole(wpAdmin)
        .navigateTo('/wp-admin/admin.php?page=wc-settings&tab=checkout&section=upfw')
        .expect(wcUnivapaySettingPage.enabled.checked).eql(true)
        .expect(wcUnivapaySettingPage.widget.value).eql(process.env.E2E_WIDGET)
        .expect(wcUnivapaySettingPage.api.value).eql(process.env.E2E_API)
        .expect(wcUnivapaySettingPage.formUrl.value).contains(process.env.E2E_FORM_URL)
        .navigateTo('/wp-admin/edit.php?post_type=product')
        .expect(wcProductListPage.product1.withText('Test Product 1').exists).ok()
        .expect(wcProductListPage.product1.withText('test-product-1').exists).ok()
        .expect(wcProductListPage.product1.withText('¥1,000.00').exists).ok()
        .expect(wcProductListPage.product2.withText('Test Product 2').exists).ok()
        .expect(wcProductListPage.product2.withText('test-product-2').exists).ok()
        .expect(wcProductListPage.product2.withText('¥2,000.00').exists).ok()
        .navigateTo('/wp-admin/edit.php?post_type=shop_coupon')
        .expect(wcCoupontListPage.coupon.withText('testcoupon').exists).ok()
        .expect(wcCoupontListPage.coupon.withText('10').exists).ok()
})

fixture `Check Univapay Console`
    .page `${config.univapayConsoleUrl}`

test('Univapay Console should be accessible', async t => {
    await t
        .useRole(univapayConsoleUser)
        .navigateTo('/dashboard/summary')
        .expect(Selector('span[data-name="main-content-title"].h3.me-3').innerText).contains('Dashboard')
})
