const short = require('short-uuid')
export class MockBillingData {
    email: string
    billingCountry: string
    billingLastName: string
    billingFirstName: string
    billingPostcode: string
    billingState: string
    billingCity: string
    billingAddress: string
    billingPhone: string

    constructor() {
        this.email = `${short.generate()}@e2e-wc.com`
        this.billingCountry = "Japan"
        this.billingLastName = "LastName"
        this.billingFirstName = "FirstName"
        this.billingPostcode = "123-4567"
        this.billingState = "Tokyo"
        this.billingCity = "東京"
        this.billingAddress = "テスト町1-1-1"
        this.billingPhone = "09012345678"
    }
}

export class MockCardData {
    cardName: string
    cardNumber: string
    expiry: string
    cvv: string

    constructor() {
        this.cardName = "Test Test"
        this.cardNumber = "4242424242424242"
        this.expiry = "12/99"
        this.cvv = "123"
    }
}
