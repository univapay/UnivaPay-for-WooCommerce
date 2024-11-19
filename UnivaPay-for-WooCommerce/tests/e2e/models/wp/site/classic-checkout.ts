import { Selector } from "testcafe"
import { MockBillingData } from "../../../helper/mock"

class WCClassicCheckoutPage {
    billingLastName = Selector('input#billing_last_name')
    billingFirstName = Selector('input#billing_first_name')
    billingCountry = Selector('main span').withText('Japan').nth(3)
    billingPostcode = Selector('input#billing_postcode')
    billingState = Selector('main span').withText('Select an option…').nth(4)
    billingStateSearch = Selector('input.select2-search__field')
    billingCity = Selector('input#billing_city')
    billingAddress = Selector('input#billing_address_1')
    billingPhone = Selector('input#billing_phone')
    orderSummary = Selector('main h3').withText('Your order')
    email = Selector('input#billing_email')
    couponLink = Selector('a.showcoupon')
    couponText = Selector('input#coupon_code')
    couponApplyButton = Selector('button[name="apply_coupon"]')
    placeOrderButton = Selector('a#upfw_order').withText('注文する');

    async navigateToCheckout(t: TestController) {
        await t
            .navigateTo('/checkout/')
            .expect(this.orderSummary.exists).ok({ timeout: 3000 })
    }

    async fillCheckoutForm(t: TestController, mockBillingData: MockBillingData) {
        await t
            .typeText(this.email, mockBillingData.email)
            .click(this.billingCountry).wait(500)
            .click(Selector('li').withText('Japan'))
            .typeText(this.billingLastName, mockBillingData.billingLastName)
            .typeText(this.billingFirstName, mockBillingData.billingFirstName)
            .typeText(this.billingPostcode, mockBillingData.billingPostcode)
            .click(this.billingState).wait(500)
            .typeText(this.billingStateSearch, mockBillingData.billingState).pressKey('enter')
            .typeText(this.billingCity, mockBillingData.billingCity)
            .typeText(this.billingAddress, mockBillingData.billingAddress) 
            .typeText(this.billingPhone, mockBillingData.billingPhone)
    }

    async appplyCoupon(t: TestController) {
        await t
            .click(this.couponLink).wait(500)
            .typeText(this.couponText, 'testcoupon')
            .click(this.couponApplyButton)
    }

    async finishCheckout(t: TestController) {
        await t
            .click(this.placeOrderButton)
    }
}

export default new WCClassicCheckoutPage()
