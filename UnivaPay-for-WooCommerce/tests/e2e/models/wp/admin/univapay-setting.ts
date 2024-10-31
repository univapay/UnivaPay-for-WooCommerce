import { Selector } from "testcafe"

class WCUnivapaySettingPage {
    enabled: Selector
    widget: Selector
    api: Selector
    formUrl: Selector

    constructor() {
        this.enabled = Selector("input#woocommerce_upfw_enabled")
        this.widget = Selector("input#woocommerce_upfw_widget")
        this.api = Selector("input#woocommerce_upfw_api")
        this.formUrl = Selector("input#woocommerce_upfw_formurl")
    }
}

export default new WCUnivapaySettingPage()
