import { randomUUID } from 'crypto'
import { config } from '../../../config'
import { univapayConsoleUser } from '../../../helper/role'
import wcShopPage from '../../../models/wp/site/shop'
import wcBlockCheckoutPage from '../../../models/wp/site/block-checkout'
import wcOrderCompletePage from '../../../models/wp/site/order-complete'
import { UnivapayInlinePage } from '../../../models/univapay/inline-form'
import univapayConsoleTransactionsListPage from '../../../models/univapay/console/transactions-list'
import univapayConsoleTransactionDetailPage from '../../../models/univapay/console/transaction-detail'

fixture `Block Checkout`
    .page `${config.wpUrl}`

// uuid on email as unique request identifier
const email = `${randomUUID()}@e2e-wc.com`

const mockInput = {
    // use email as unique identifier
    email: email,
    billingCountry: "Japan",
    billingLastName: "LastName",
    billingFirstName: "FirstName",
    billingPostcode: "123-4567",
    billingState: "Tokyo",
    billingCity: "東京",
    billingAddress: "テスト町1-1-1",
    billingPhone: "09012345678",
    cardName: "Test Test",
    cardNumber: "4242424242424242",
    expiry: "12/99",
    cvv: "123"
}

const univapayInlinePage = new UnivapayInlinePage()

const orderDetails: { orderNumber?: string, charge?: string } = {}

test('WC Block Checkout Inline Payment Should Be Able To Complete Order', async t => {
    await t
        // shop
        .navigateTo('?post_type=product')
        .click(wcShopPage.addProduct1)
        .click(wcShopPage.addProduct2)
        // checkout
        .navigateTo('?page_id=7')
        .expect(wcBlockCheckoutPage.orderSummary.exists).ok({ timeout: 3000 })
        .typeText(wcBlockCheckoutPage.email, mockInput.email)
        .click(wcBlockCheckoutPage.billingCountry)
        .click(wcBlockCheckoutPage.billingCountry.find('option').withText(mockInput.billingCountry))
        .typeText(wcBlockCheckoutPage.billingLastName, mockInput.billingLastName)
        .typeText(wcBlockCheckoutPage.billingFirstName, mockInput.billingFirstName)
        .typeText(wcBlockCheckoutPage.billingPostcode, mockInput.billingPostcode)
        .click(wcBlockCheckoutPage.billingState)
        .click(wcBlockCheckoutPage.billingState.find('option').withText(mockInput.billingState))
        .typeText(wcBlockCheckoutPage.billingCity, mockInput.billingCity)
        .typeText(wcBlockCheckoutPage.billingAddress, mockInput.billingAddress) 
        .typeText(wcBlockCheckoutPage.billingPhone, mockInput.billingPhone)
        .click(wcBlockCheckoutPage.couponLink)
        .typeText(wcBlockCheckoutPage.couponText, 'testcoupon')
        .click(wcBlockCheckoutPage.couponApplyButton)
        // inline payment
        .switchToIframe(univapayInlinePage.iframe)
        .typeText(univapayInlinePage.name, mockInput.cardName)
        .typeText(univapayInlinePage.card, mockInput.cardNumber)
        .typeText(univapayInlinePage.expiry, mockInput.expiry)
        .typeText(univapayInlinePage.cvv, mockInput.cvv)
        .switchToMainWindow() 
        .click(wcBlockCheckoutPage.placeOrderButton)
        .expect(wcOrderCompletePage.orderConfirmation.exists).ok({ timeout: 10000 })
        .expect(wcOrderCompletePage.orderEmail.innerText).eql(mockInput.email)
        .expect(wcOrderCompletePage.orderBillingAddress.innerText).contains(mockInput.billingPostcode)
        .expect(wcOrderCompletePage.orderBillingAddress.innerText).contains(mockInput.billingState)
        .expect(wcOrderCompletePage.orderBillingAddress.innerText).contains(mockInput.billingCity)
        .expect(wcOrderCompletePage.orderBillingAddress.innerText).contains(mockInput.billingAddress)
        .expect(wcOrderCompletePage.orderBillingAddress.innerText).contains(`${mockInput.billingLastName} ${mockInput.billingFirstName}`)
        .expect(wcOrderCompletePage.orderBillingAddress.innerText).contains(mockInput.billingPhone)

    orderDetails.orderNumber = await wcOrderCompletePage.orderNumber.innerText
    const charge = await wcOrderCompletePage.orderPrice.innerText
    // Remove .00 from orderDetails.charge if it ends with .00
    orderDetails.charge = charge.endsWith('.00') ? charge.slice(0, -3) : charge
})

fixture `Univapay Console`
    .page `${config.univapayConsoleUrl}`

test('Univapay Console Should Receive The Same Order Request', async t => {
    const searchQuery = `?email=${mockInput.email}&limit=10&mode=test`

    if (!orderDetails.orderNumber || !orderDetails.charge) {
        throw new Error('Order details are empty, checkout order has failed.') 
    }

    await t
        .useRole(univapayConsoleUser)
        .navigateTo(`/dashboard/transactions${searchQuery}`)
        .expect(univapayConsoleTransactionsListPage.row.exists).ok({ timeout: 5000 })
        .expect(univapayConsoleTransactionsListPage.row.count).eql(1)
        .click(univapayConsoleTransactionsListPage.row.nth(0))
        .expect(univapayConsoleTransactionDetailPage.tokenType.exists).ok({ timeout: 5000 })
        .expect(univapayConsoleTransactionDetailPage.tokenType.innerText).eql('One-time')
        .expect(univapayConsoleTransactionDetailPage.status.innerText).eql('Successful')
        .expect(univapayConsoleTransactionDetailPage.charge.innerText).contains(orderDetails.charge)
        .expect(univapayConsoleTransactionDetailPage.tokenMetadata.innerText).contains(`"order_id": ${orderDetails.orderNumber}`)
})
