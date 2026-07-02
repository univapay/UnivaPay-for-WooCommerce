import { Selector } from 'testcafe';
import WCOrderCompletePage from './order-complete';
import { MockBillingData } from '../../../helper/mock';
import { UnivapayLinkFormPage } from '../../../models/univapay/link-form';

class WCBlockCheckoutPage {
	email = Selector( 'input#email' );
	billingCountry = Selector( 'select#billing-country' );
	billingLastName = Selector( 'input#billing-last_name' );
	billingFirstName = Selector( 'input#billing-first_name' );
	billingPostcode = Selector( 'input#billing-postcode' );
	billingState = Selector( 'select#billing-state' );
	billingCity = Selector( 'input#billing-city' );
	billingAddress = Selector( 'input#billing-address_1' );
	billingPhone = Selector( 'input#billing-phone' );
	couponLink = Selector( 'div.wc-block-components-panel__button' ).withText(
		'Add coupons'
	);
	couponText = Selector(
		'input#wc-block-components-totals-coupon__input-coupon'
	);
	couponApplyButton = Selector(
		'form#wc-block-components-totals-coupon__form'
	).find( 'button[type="submit"]' );
	orderSummary = Selector( 'main div' ).withText( 'Order summary' );
	placeOrderButton = Selector(
		'button.wc-block-components-checkout-place-order-button'
	).withText( 'Place Order' );
	linkForm = Selector( 'a[type="button"]#upfw_optional' );

	async navigateToCheckout( t: TestController ) {
		await t
			.navigateTo( '/checkout/' )
			.expect( this.orderSummary.exists )
			.ok( { timeout: 3000 } );
	}

	async navigateToLinkForm( t: TestController ) {
		await t
			.click( this.linkForm )
			.expect( new UnivapayLinkFormPage().page.exists )
			.ok( { timeout: 10000 } );
	}

	async fillCheckoutForm(
		t: TestController,
		mockBillingData: MockBillingData
	) {
		await t
			.typeText( this.email, mockBillingData.email, { replace: true } )
			.typeText( this.billingLastName, mockBillingData.billingLastName, { replace: true } )
			.typeText( this.billingFirstName, mockBillingData.billingFirstName, { replace: true } )
			.typeText( this.billingPostcode, mockBillingData.billingPostcode, { replace: true } )
			.click( this.billingState )
			.wait( 500 )
			.click(
				this.billingState
					.find( 'option' )
					.withText( mockBillingData.billingState )
			)
			.wait( 500 )
			.typeText( this.billingCity, mockBillingData.billingCity, { replace: true } )
			.typeText( this.billingAddress, mockBillingData.billingAddress, { replace: true } )
			.typeText( this.billingPhone, mockBillingData.billingPhone, { replace: true } );
	}

	async applyCoupon( t: TestController ) {
		await t
			.click( this.couponLink )
			.wait( 500 )
			.typeText( this.couponText, 'testcoupon', { replace: true } )
			.click( this.couponApplyButton )
			.wait( 3000 );
	}

	async finishCheckout( t: TestController ) {
		await t
			.click( this.placeOrderButton )
			.expect( WCOrderCompletePage.orderConfirmation.exists )
			.ok( { timeout: 20000 } );
	}
}

export default new WCBlockCheckoutPage();
