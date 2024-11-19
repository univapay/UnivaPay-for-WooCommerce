import { Selector } from "testcafe"

class UnivapayConsoleLoginPage {
    email = Selector('#email')
    password = Selector('#password')
    submit = Selector('button[type="submit"]')
}

export default new UnivapayConsoleLoginPage()
