import { Selector } from "testcafe"

class UnivapayConsoleTransactionDetailPage {
    tokenType: Selector
    status: Selector
    charge: Selector
    chargeMetadata: Selector
    tokenMetadata: Selector

    constructor() {
        this.tokenType = Selector('div[data-name="token-type-field"]').find('div[data-name="static-field-body"]')
        this.status = Selector('div[data-name="status-field"]').find('div[data-name="static-field-body"]')
        this.charge = Selector('div[data-name="charged-amount-field"]').find('div[data-name="static-field-body"]')
        this.chargeMetadata = Selector('div[data-name="charge-metadata-field"]').find('div[data-name="static-field-body"]')
        this.tokenMetadata = Selector('div[data-name="token-metadata-field"]').find('div[data-name="static-field-body"]')
    }

    async confimTransactionDetail(t: TestController, orderDetails: { orderNumber: string, charge: string }) {
        await t
            .expect(this.tokenType.exists).ok({ timeout: 3000 })
            .expect(this.tokenType.innerText).eql('One-time')
            .expect(this.status.innerText).eql('Successful')
            .expect(this.charge.innerText).contains(orderDetails.charge)
            .expect(this.chargeMetadata.innerText).contains(`"order_id": ${orderDetails.orderNumber}`)
    }
}

export default new UnivapayConsoleTransactionDetailPage()
