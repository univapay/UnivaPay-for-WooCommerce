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

export const mockProduct1 = {
    name: "Test Product 1",
    sku: "test-product-1",
    price: "¥1,000.00"
}

export const mockProduct2 = {
    name: "Test Product 2",
    sku: "test-product-2",
    price: "¥2,000.00"
}

export const mockCoupon = {
    name: "testcoupon",
    discount: "10"
}
