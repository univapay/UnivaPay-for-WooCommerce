import { Selector } from "testcafe"

class WCUnivapaySettingPage {
    enabled: Selector
    widget: Selector
    api: Selector
    formUrl: Selector

    constructor() {
        this.enabled = Selector("#woocommerce_upfw_enabled")
        this.widget = Selector("#woocommerce_upfw_widget")
        this.api = Selector("#woocommerce_upfw_api")
        this.formUrl = Selector("#woocommerce_upfw_formurl")
    }
}

export default new WCUnivapaySettingPage()
