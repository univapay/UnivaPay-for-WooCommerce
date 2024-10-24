import { Selector } from "testcafe"

class WPLoginPage {
    user: Selector
    password: Selector
    submit: Selector

    constructor() {
        this.user = Selector('#user_login')
        this.password = Selector('#user_pass')
        this.submit = Selector('#wp-submit')
    }    
}

export default new WPLoginPage()
