import { Selector } from 'testcafe';
import WCOrderCompletePage from './order-complete';
import { MockBillingData } from '../../../helper/mock';
import { UnivapayLinkFormPage } from '../../../models/univapay/link-form';

class WCClassicCheckoutPage {
	billingLastName = Selector( 'input#billing_last_name' );
	billingFirstName = Selector( 'input#billing_first_name' );
	billingCountry = Selector( 'main span' ).withText( 'Japan' ).nth( 3 );
	billingPostcode = Selector( 'input#billing_postcode' );
	billingState = Selector( 'main span' )
		.withText( 'Select an option…' )
		.nth( 4 );
	billingStateSearch = Selector( 'input.select2-search__field' );
	billingCity = Selector( 'input#billing_city' );
	billingAddress = Selector( 'input#billing_address_1' );
	billingPhone = Selector( 'input#billing_phone' );
	orderSummary = Selector( 'main h3' ).withText( 'Your order' );
	email = Selector( 'input#billing_email' );
	couponLink = Selector( 'a.showcoupon' );
	couponText = Selector( 'input#coupon_code' );
	couponApplyButton = Selector( 'button[name="apply_coupon"]' );
	placeOrderButton = Selector( 'button[type="submit"]#place_order' );
	linkForm = Selector( 'button#univapay_optional_button' );

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
			.click( this.billingCountry )
			.wait( 500 )
			.click( Selector( 'li' ).withText( 'Japan' ) )
			.typeText( this.billingLastName, mockBillingData.billingLastName, {
				replace: true,
			} )
			.typeText(
				this.billingFirstName,
				mockBillingData.billingFirstName,
				{ replace: true }
			)
			.typeText( this.billingPostcode, mockBillingData.billingPostcode, {
				replace: true,
			} )
			.click( this.billingState )
			.wait( 500 )
			.typeText( this.billingStateSearch, mockBillingData.billingState, {
				replace: true,
			} )
			.pressKey( 'enter' )
			.typeText( this.billingCity, mockBillingData.billingCity, {
				replace: true,
			} )
			.typeText( this.billingAddress, mockBillingData.billingAddress, {
				replace: true,
			} )
			.typeText( this.billingPhone, mockBillingData.billingPhone, {
				replace: true,
			} );
	}

	async applyCoupon( t: TestController ) {
		await t
			.click( this.couponLink )
			.wait( 500 )
			.typeText( this.couponText, 'testcoupon', { replace: true } )
			.click( this.couponApplyButton );
	}

	async finishCheckout( t: TestController ) {
		await t
			.click( this.placeOrderButton )
			.expect( WCOrderCompletePage.orderConfirmation.exists )
			.ok( { timeout: 20000 } );
	}
}

export default new WCClassicCheckoutPage();
