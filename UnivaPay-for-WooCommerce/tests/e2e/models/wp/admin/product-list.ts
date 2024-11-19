import { Selector } from "testcafe"

class WCProductListPage {
    tableBody = Selector("tbody#the-list")

    getRowByProductName(productName: string) {
        return this.tableBody.find('tr').withText(productName);
    }

    getRowByProductSku(productName: string, sku: string) {
        const row = this.tableBody.find('tr').withText(productName);
        return row.find('td').withText(sku);
    }

    getRowByProductPrice(productName: string, price: string) {
        const row = this.tableBody.find('tr').withText(productName);
        return row.find('td').withText(price);
    }
}

export default new WCProductListPage()
