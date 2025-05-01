import { Selector } from "testcafe"
import { MockCardData } from "../../helper/mock"

export class UnivapayInlinePage {
    iframe = Selector('iframe[name="univapay-checkout-connector"]', { timeout: 3000 })
    phone = Selector('input[name="data.phoneNumber"]') 
    email = Selector('input[name="data.email"]')
    name = Selector('input[name="data.cardholder"]')
    card = Selector('input[name="data.cardNumber"]')
    expiry = Selector('input[name="data.exp"]')
    cvv = Selector('input[name="data.cvv"]')

    async fillInlineForm(t: TestController, mockCardData: MockCardData) {
        await t
            .switchToIframe(this.iframe)
            .typeText(this.phone, mockCardData.phoneNumber, { replace: true })
            .typeText(this.name, mockCardData.cardName)
            .typeText(this.card, mockCardData.cardNumber)
            .typeText(this.expiry, mockCardData.expiry)
            .typeText(this.cvv, mockCardData.cvv)
            .switchToMainWindow()
    }
}

