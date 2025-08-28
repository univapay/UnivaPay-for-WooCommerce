import { Selector } from "testcafe"

class WCShopPage {
    labelProduct1 = Selector('h1').withText('Test Product 1')
    labelProduct2 = Selector('h1').withText('Test Product 2')
    addToCart = Selector('button[name="add-to-cart"]')

    async addProductToCart(t: TestController) {
        await t
            .navigateTo(`/product/test-product-1/`)
            .expect(this.labelProduct1.exists).ok({ timeout: 3000 })
            .click(this.addToCart).wait(500)
            .navigateTo(`/product/test-product-2/`)
            .expect(this.labelProduct2.exists).ok({ timeout: 3000 })
            .click(this.addToCart).wait(500)
    }
}

export default new WCShopPage()
