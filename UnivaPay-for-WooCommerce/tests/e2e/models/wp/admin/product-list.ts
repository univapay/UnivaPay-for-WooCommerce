import { Selector } from "testcafe"

class WCProductListPage {
    product1: Selector
    product2: Selector

    constructor() {
        this.product1 = Selector("#post-10 td")
        this.product2 = Selector("#post-11 td")
    }
}

export default new WCProductListPage()
