import { Selector } from "testcafe"

class UnivapayConsoleTransactionDetailPage {
    tokenType: Selector
    status: Selector
    charge: Selector
    tokenMetadata: Selector

    constructor() {
        this.tokenType = Selector('div[data-name="token-type-field"]').find('div[data-name="static-field-body"]')
        this.status = Selector('div[data-name="status-field"]').find('div[data-name="static-field-body"]')
        this.charge = Selector('div[data-name="charged-amount-field"]').find('div[data-name="static-field-body"]')
        this.tokenMetadata = Selector('div[data-name="token-metadata-field"]').find('div[data-name="static-field-body"]')
    }
}

export default new UnivapayConsoleTransactionDetailPage()
