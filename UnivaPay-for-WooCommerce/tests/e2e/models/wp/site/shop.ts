import { Selector } from "testcafe"

class WCShopPage {
    title = Selector('h1').withText('Shop')
    product1 = Selector('button[data-product_sku="test-product-1"]')
    product2 = Selector('button[data-product_sku="test-product-2"]')

    async navigateToShop(t: TestController) {
        await t
            .navigateTo('/shop/')
            .expect(this.title.exists).ok({ timeout: 3000 })
    }

    async addProductToCart(t: TestController) {
        await t
            .click(this.product1).wait(500)
            .click(this.product2).wait(500)
    }
}

export default new WCShopPage()
