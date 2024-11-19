import { Selector } from "testcafe"
import { MockBillingData } from "../../../helper/mock"

class WCOrderCompletePage {
    orderConfirmation = Selector('div[data-block-name="woocommerce/order-confirmation-status"]')
    summaryList = Selector('ul.wc-block-order-confirmation-summary-list li')
    orderNumber = this.summaryList.nth(0).find('span.wc-block-order-confirmation-summary-list-item__value')
    orderPrice = this.summaryList.nth(2).find('span.wc-block-order-confirmation-summary-list-item__value')
    orderEmail = this.summaryList.nth(3).find('span.wc-block-order-confirmation-summary-list-item__value')
    orderPaymentMethod = this.summaryList.nth(4).find('span.wc-block-order-confirmation-summary-list-item__value')
    orderBillingAddress = Selector('div[data-block-name="woocommerce/order-confirmation-billing-address"]')

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
