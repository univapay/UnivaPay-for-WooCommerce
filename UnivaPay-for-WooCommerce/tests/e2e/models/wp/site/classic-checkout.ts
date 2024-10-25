import { Selector } from "testcafe"
import { MockBillingData } from "../../../helper/mock"

class WCClassicCheckoutPage {
    billingLastName: Selector
    billingFirstName: Selector
    billingCountry: Selector
    billingPostcode: Selector
    billingState: Selector
    billingStateSearch: Selector
    billingCity: Selector
    billingAddress: Selector
    billingPhone: Selector
    orderSummary: Selector
    email: Selector
    couponLink: Selector
    couponText: Selector
    couponApplyButton: Selector
    placeOrderButton: Selector

    constructor() {
        this.billingLastName = Selector('input#billing_last_name')
        this.billingFirstName = Selector('input#billing_first_name')
        this.billingCountry = Selector('select#billing_country')
        this.billingPostcode = Selector('input#billing_postcode')
        this.billingState = Selector('main span').withText('Select an option…').nth(4)
        this.billingStateSearch = Selector('input.select2-search__field')
        this.billingCity = Selector('input#billing_city')
        this.billingAddress = Selector('input#billing_address_1')
        this.billingPhone = Selector('input#billing_phone')
        this.email = Selector('input#billing_email')
        this.orderSummary = Selector('main h3').withText('Your order')
        this.couponLink = Selector('a.showcoupon')
        this.couponText = Selector('input#coupon_code')
        this.couponApplyButton = Selector('button[name="apply_coupon"]')
        this.placeOrderButton = Selector('a#upfw_order').withText('注文する');
    }

    async navigateToCheckout(t: TestController) {
        await t
            .navigateTo('/checkout/')
            .expect(this.orderSummary.exists).ok({ timeout: 3000 })
    }

    async fillCheckoutForm(t: TestController, mockBillingData: MockBillingData) {
        await t
            .typeText(this.email, mockBillingData.email)
            // .click(this.billingCountry).wait(500)
            // .click(this.billingCountry.find('option').withText(mockBillingData.billingCountry))
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
