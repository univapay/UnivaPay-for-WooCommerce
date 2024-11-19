import { Selector } from 'testcafe'
import { config } from './config'
import { wpAdmin, univapayConsoleUser } from './helper/role'
import { mockProduct1, mockProduct2, mockCoupon } from './helper/mock'
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
        .expect(wcUnivapaySettingPage.widget.value).eql(process.env.E2E_WIDGET_URL)
        .expect(wcUnivapaySettingPage.api.value).eql(process.env.E2E_API_URL)
        .expect(wcUnivapaySettingPage.formUrl.value).contains(process.env.E2E_FORM_URL)
        .navigateTo('/wp-admin/edit.php?post_type=product')
        .expect(wcProductListPage.getRowByProductName(mockProduct1.name).exists).ok()
        .expect(wcProductListPage.getRowByProductSku(mockProduct1.name, mockProduct1.sku).exists).ok()
        .expect(wcProductListPage.getRowByProductPrice(mockProduct1.name, mockProduct1.price).exists).ok()
        .expect(wcProductListPage.getRowByProductName(mockProduct2.name).exists).ok()
        .expect(wcProductListPage.getRowByProductSku(mockProduct2.name, mockProduct2.sku).exists).ok()
        .expect(wcProductListPage.getRowByProductPrice(mockProduct2.name, mockProduct2.price).exists).ok()
        .navigateTo('/wp-admin/edit.php?post_type=shop_coupon')
        .expect(wcCoupontListPage.getRowByCouponName(mockCoupon.name).exists).ok()
        .expect(wcCoupontListPage.getRowByCouponDiscount(mockCoupon.name, mockCoupon.discount).exists).ok()
})

fixture `Check Univapay Console`
    .page `${config.univapayConsoleUrl}`

test('Univapay Console should be accessible', async t => {
    await t
        .useRole(univapayConsoleUser)
        .navigateTo('/dashboard/summary')
        .expect(Selector('span[data-name="main-content-title"].h3.me-3').innerText).contains('Dashboard')
})
