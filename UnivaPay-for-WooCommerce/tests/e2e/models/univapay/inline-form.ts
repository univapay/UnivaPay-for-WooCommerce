import { Selector } from "testcafe"
import { MockCardData } from "../../helper/mock"

export class UnivapayInlinePage {
    iframe: Selector
    email: Selector
    name: Selector
    card: Selector
    expiry: Selector
    cvv: Selector

    constructor() {
        this.iframe = Selector('iframe[name="univapay-checkout-connector"]', { timeout: 3000 })
        this.email = Selector('input[name="data.email"]')
        this.name = Selector('input[name="data.cardholder"]')
        this.card = Selector('input[name="data.cardNumber"]')
        this.expiry = Selector('input[name="data.exp"]')
        this.cvv = Selector('input[name="data.cvv"]')
    }

    async fillInlineForm(t: TestController, mockCardData: MockCardData) {
        await t
            .switchToIframe(this.iframe)
            .typeText(this.name, mockCardData.cardName)
            .typeText(this.card, mockCardData.cardNumber)
            .typeText(this.expiry, mockCardData.expiry)
            .typeText(this.cvv, mockCardData.cvv)
            .switchToMainWindow()
    }
}

