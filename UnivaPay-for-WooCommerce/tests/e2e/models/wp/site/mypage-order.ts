import { Selector } from 'testcafe';
import { config } from '../../../config';
import wcOrderCompletePage from './order-complete';

class WCMypageOrderPage {
	ordersTab = Selector( 'a' ).withText( 'Orders' );
	payButton = Selector( 'a' ).withText( 'Pay' ).nth( 0 );
	placeOrderButton = Selector( 'button#place_order' );

	async navigateToMyAccount( t: TestController ) {
		await t.navigateTo( `${ config.wpUrl }/my-account/` ).wait( 2000 );
	}

	async navigateToOrders( t: TestController ) {
		await t.click( this.ordersTab ).wait( 2000 );
	}

	async clickPayOnFirstOrder( t: TestController ) {
		await t.click( this.payButton ).wait( 2000 );
	}

	async finishPayment( t: TestController ) {
		await t
			.click( this.placeOrderButton )
			.expect( wcOrderCompletePage.orderConfirmation.exists )
			.ok( { timeout: 20000 } );
	}
}

export default new WCMypageOrderPage();
