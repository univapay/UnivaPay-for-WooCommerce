import { Selector } from "testcafe"

class WPLoginPage {
    user = Selector('#user_login')
    password = Selector('#user_pass')
    submit = Selector('#wp-submit')
}

export default new WPLoginPage()
