import { Selector } from "testcafe"

class WCCouponListPage {
    tableBody = Selector("tbody#the-list")

    getRowByCouponName(name: string) {
        return this.tableBody.find('tr').withText(name);
    }

    getRowByCouponDiscount(name: string, discount: string) {
        const row = this.tableBody.find('tr').withText(name);
        return row.find('td').withText(discount);
    }
}

export default new WCCouponListPage()
