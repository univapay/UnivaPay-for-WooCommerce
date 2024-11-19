import { Selector } from "testcafe"
import { MockBillingData } from "../../../helper/mock"

class WCBlockCheckoutPage {
    email = Selector('input#email')
    billingCountry = Selector('select#billing-country')
    billingLastName = Selector('input#billing-last_name')
    billingFirstName = Selector('input#billing-first_name')
    billingPostcode = Selector('input#billing-postcode')
    billingState = Selector('select#billing-state')
    billingCity = Selector('input#billing-city')
    billingAddress = Selector('input#billing-address_1')
    billingPhone = Selector('input#billing-phone')
    couponLink = Selector('button.wc-block-components-panel__button').withText('Add a coupon')
    couponText = Selector('input#wc-block-components-totals-coupon__input-0')
    couponApplyButton = Selector('form#wc-block-components-totals-coupon__form').find('button[type="submit"]')
    orderSummary = Selector('span.wc-block-components-order-summary__button-text')
    placeOrderButton = Selector('button.wc-block-components-checkout-place-order-button').withText('Place Order');

    async navigateToCheckout(t: TestController) {
        await t
            .navigateTo('/checkout/')
            .expect(this.orderSummary.exists).ok({ timeout: 3000 })
    }

    async fillCheckoutForm(t: TestController, mockBillingData: MockBillingData) {
        await t
            .typeText(this.email, mockBillingData.email)
            .click(this.billingCountry).wait(500)
            .click(this.billingCountry.find('option').withText(mockBillingData.billingCountry)).wait(500)
            .typeText(this.billingLastName, mockBillingData.billingLastName)
            .typeText(this.billingFirstName, mockBillingData.billingFirstName)
            .typeText(this.billingPostcode, mockBillingData.billingPostcode)
            .click(this.billingState).wait(500)
            .click(this.billingState.find('option').withText(mockBillingData.billingState)).wait(500)
            .typeText(this.billingCity, mockBillingData.billingCity)
            .typeText(this.billingAddress, mockBillingData.billingAddress) 
            .typeText(this.billingPhone, mockBillingData.billingPhone)
    }

    async appplyCoupon(t: TestController) {
        await t
            .click(this.couponLink).wait(500)
            .typeText(this.couponText, 'testcoupon')
            .click(this.couponApplyButton).wait(3000)
    }

    async finishCheckout(t: TestController) {
        await t
            .click(this.placeOrderButton)
    }
}

export default new WCBlockCheckoutPage()
