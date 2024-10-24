import { Selector } from "testcafe"

class WCBlockCheckoutPage {
    email: Selector
    billingCountry: Selector
    billingLastName: Selector
    billingFirstName: Selector
    billingPostcode: Selector
    billingState: Selector
    billingCity: Selector
    billingAddress: Selector
    billingPhone: Selector
    couponLink: Selector
    couponText: Selector
    couponApplyButton: Selector
    orderSummary: Selector
    placeOrderButton: Selector

    constructor() {
        this.email = Selector('input#email')
        this.billingCountry = Selector('select#billing-country')
        this.billingLastName = Selector('input#billing-last_name')
        this.billingFirstName = Selector('input#billing-first_name')
        this.billingPostcode = Selector('input#billing-postcode')
        this.billingState = Selector('select#billing-state')
        this.billingCity = Selector('input#billing-city')
        this.billingAddress = Selector('input#billing-address_1')
        this.billingPhone = Selector('input#billing-phone')
        this.couponLink = Selector('button.wc-block-components-panel__button').withText('Add a coupon')
        this.couponText = Selector('input#wc-block-components-totals-coupon__input-0')
        this.couponApplyButton = Selector('form#wc-block-components-totals-coupon__form').find('button[type="submit"]')
        this.orderSummary = Selector('span.wc-block-components-order-summary__button-text')
        this.placeOrderButton = Selector('button.wc-block-components-checkout-place-order-button').withText('Place Order');
    }
}

export default new WCBlockCheckoutPage()
