import { Selector } from "testcafe"

class WCShopPage {
    addProduct1: Selector
    addProduct2: Selector

    constructor() {
        this.addProduct1 = Selector('button.wp-block-button__link').withAttribute('data-product_id', '10')
        this.addProduct2 = Selector('button.wp-block-button__link').withAttribute('data-product_id', '11')
    }
}

export default new WCShopPage()
