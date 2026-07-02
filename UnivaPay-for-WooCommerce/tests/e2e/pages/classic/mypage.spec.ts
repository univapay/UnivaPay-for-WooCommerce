import { config } from '../../config';
import { MockBillingData, MockCardData } from '../../helper/mock';
import wcShopPage from '../../models/wp/site/shop';
import wcClassicCheckoutPage from '../../models/wp/site/classic-checkout';
import wcMypageOrderPage from '../../models/wp/site/mypage-order';
import myAccountPage from '../../models/wp/site/myaccount-login';
import { UnivapayInlinePage } from '../../models/univapay/inline-form';

// eslint-disable-next-line
fixture`Classic Checkout`.page`${ config.wpUrl }`;

test( 'WC MyPage Order Pay Should Be Able To Complete Payment', async ( t ) => {
	const univapayInlinePage = new UnivapayInlinePage();
	const mockBillingData = new MockBillingData();

	await myAccountPage.login( t );

	// Create an unpaid order
	await wcShopPage.addProductToCart( t );
	await wcClassicCheckoutPage.navigateToCheckout( t );
	await wcClassicCheckoutPage.applyCoupon( t );
	await wcClassicCheckoutPage.fillCheckoutForm( t, mockBillingData );
	await wcClassicCheckoutPage.navigateToLinkForm( t );

	// Navigate to MyAccount Orders and pay for the order
	await wcMypageOrderPage.navigateToMyAccount( t );
	await wcMypageOrderPage.navigateToOrders( t );
	await wcMypageOrderPage.clickPayOnFirstOrder( t );
	await univapayInlinePage.fillInlineForm( t, new MockCardData() );
	await wcMypageOrderPage.finishPayment( t );
} );
