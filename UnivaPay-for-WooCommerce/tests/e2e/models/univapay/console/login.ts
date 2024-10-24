import { Selector } from "testcafe"

class UnivapayConsoleLoginPage {
    email: Selector
    password: Selector
    submit: Selector

    constructor() {
        this.email = Selector('#email')
        this.password = Selector('#password')
        this.submit = Selector('button[type="submit"]')
    }    
}

export default new UnivapayConsoleLoginPage()
