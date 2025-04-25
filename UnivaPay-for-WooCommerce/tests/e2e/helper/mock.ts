const short = require('short-uuid')

export class MockBillingData {
    email = `${short.generate()}@e2e-wc.com`
    billingCountry = "Japan"
    billingLastName = "LastName"
    billingFirstName = "FirstName"
    billingPostcode = "123-4567"
    billingState = "Tokyo"
    billingCity = "東京"
    billingAddress = "テスト町1-1-1"
    billingPhone = "09012345678"
}

export class MockCardData {
    phoneNumber = "09012345678"
    cardName = "Test Test"
    cardNumber = "4242424242424242"
    expiry = "12/99"
    cvv = "123"
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
