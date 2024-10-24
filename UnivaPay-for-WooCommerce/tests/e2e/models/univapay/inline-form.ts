import { Selector } from "testcafe"

export class UnivapayInlinePage {
    iframe: Selector
    name: Selector
    card: Selector
    expiry: Selector
    cvv: Selector

    constructor() {
        this.iframe = Selector('iframe[name="univapay-checkout-connector"]', { timeout: 3000 })
        this.name = Selector('input[name="data.cardholder"]')
        this.card = Selector('input[name="data.cardNumber"]')
        this.expiry = Selector('input[name="data.exp"]')
        this.cvv = Selector('input[name="data.cvv"]')
    }
}

