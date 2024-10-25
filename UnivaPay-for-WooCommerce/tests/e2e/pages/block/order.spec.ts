import { config } from '../../config'
import { univapayConsoleUser } from '../../helper/role'
import { MockBillingData, MockCardData } from '../../helper/mock'
import wcShopPage from '../../models/wp/site/shop'
import wcBlockCheckoutPage from '../../models/wp/site/block-checkout'
import wcOrderCompletePage from '../../models/wp/site/order-complete'
import { UnivapayInlinePage } from '../../models/univapay/inline-form'
import univapayConsoleTransactionsListPage from '../../models/univapay/console/transactions-list'
import univapayConsoleTransactionDetailPage from '../../models/univapay/console/transaction-detail'

fixture `Block Checkout`
    .page `${config.wpUrl}`

let orderDetails: { 
    orderNumber: string,
    charge: string 
} = { orderNumber: '', charge: '' }

const mockBillingData = new MockBillingData()

test('WC Block Checkout Inline Payment Should Be Able To Complete Order', async t => {
    const univapayInlinePage = new UnivapayInlinePage()

    await wcShopPage.navigateToShop(t)
    await wcShopPage.addProductToCart(t)
    await wcBlockCheckoutPage.navigateToCheckout(t)
    await wcBlockCheckoutPage.fillCheckoutForm(t, mockBillingData)
    await wcBlockCheckoutPage.appplyCoupon(t)
    await univapayInlinePage.fillInlineForm(t, new MockCardData())
    await wcBlockCheckoutPage.finishCheckout(t)
    await wcOrderCompletePage.confirmOrderComplete(t, mockBillingData)

    orderDetails.orderNumber = await wcOrderCompletePage.orderNumber.innerText
    const charge = await wcOrderCompletePage.orderPrice.innerText
    // Remove .00 from orderDetails.charge if it ends with .00
    orderDetails.charge = charge.endsWith('.00') ? charge.slice(0, -3) : charge
})

fixture `Univapay Console`
    .page `${config.univapayConsoleUrl}`

test('Univapay Console Should Receive The Same Order Request', async t => {
    if (!orderDetails.orderNumber || !orderDetails.charge) {
        throw new Error('Order details are empty, checkout order has failed.') 
    }

    const searchQuery = `?email=${mockBillingData.email}&limit=10&mode=test`
    console.log(`Search query: ${searchQuery}`)

    await t.useRole(univapayConsoleUser)
    await univapayConsoleTransactionsListPage.navigateToTransactionList(t, searchQuery)
    await univapayConsoleTransactionsListPage.confirmTransactionList(t)
    await univapayConsoleTransactionsListPage.navigateToTransactionDetail(t)
    await univapayConsoleTransactionDetailPage.confimTransactionDetail(t, orderDetails)
})
