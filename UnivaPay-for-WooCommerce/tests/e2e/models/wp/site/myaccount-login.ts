import { Selector } from 'testcafe';

class MyAccountPage {
	username = Selector( 'input#username' );
	password = Selector( 'input#password' );
	loginButton = Selector( 'button[name="login"][type="submit"]' );

	async login( t: TestController ) {
		await t
			.navigateTo( `/my-account/` )
			.expect( this.username.exists )
			.ok()
			.typeText( this.username, 'admin' )
			.typeText( this.password, 'admin' )
			.click( this.loginButton )
			.wait( 2000 );
	}
}

export default new MyAccountPage();
