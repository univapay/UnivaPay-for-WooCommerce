import { Selector } from "testcafe"

class WCCouponListPage {
    coupon: Selector

    constructor() {
        this.coupon = Selector("#post-12 td")
    }
}

export default new WCCouponListPage()
