import { Selector } from "testcafe"
import { MockBillingData } from "../../../helper/mock"

class WCOrderCompletePage {
    orderConfirmation: Selector
    summaryList: Selector
    orderNumber: Selector
    orderPrice: Selector
    orderEmail: Selector
    orderPaymentMethod: Selector
    orderBillingAddress: Selector

    constructor() {
        this.orderConfirmation = Selector('div[data-block-name="woocommerce/order-confirmation-status"]')
        this.summaryList = Selector('ul.wc-block-order-confirmation-summary-list li')
        this.orderNumber = this.summaryList.nth(0).find('span.wc-block-order-confirmation-summary-list-item__value')
        this.orderPrice = this.summaryList.nth(2).find('span.wc-block-order-confirmation-summary-list-item__value')
        this.orderEmail = this.summaryList.nth(3).find('span.wc-block-order-confirmation-summary-list-item__value')
        this.orderPaymentMethod = this.summaryList.nth(4).find('span.wc-block-order-confirmation-summary-list-item__value')
        this.orderBillingAddress = Selector('div[data-block-name="woocommerce/order-confirmation-billing-address"]')
    }

    async confirmOrderComplete(t: TestController, mockBillingData: MockBillingData) {
        await t
            .expect(this.orderEmail.innerText).eql(mockBillingData.email)
            .expect(this.orderBillingAddress.innerText).contains(mockBillingData.billingPostcode)
            .expect(this.orderBillingAddress.innerText).contains(mockBillingData.billingState)
            .expect(this.orderBillingAddress.innerText).contains(mockBillingData.billingCity)
            .expect(this.orderBillingAddress.innerText).contains(mockBillingData.billingAddress)
            .expect(this.orderBillingAddress.innerText).contains(`${mockBillingData.billingLastName} ${mockBillingData.billingFirstName}`)
            .expect(this.orderBillingAddress.innerText).contains(mockBillingData.billingPhone)
    }
}

export default new WCOrderCompletePage()