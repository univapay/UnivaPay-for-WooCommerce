import { Selector } from "testcafe"

class WCUnivapaySettingPage {
    enabled = Selector("input#woocommerce_upfw_enabled")
    widget = Selector("input#woocommerce_upfw_widget")
    api = Selector("input#woocommerce_upfw_api")
    formUrl = Selector("input#woocommerce_upfw_formurl")
}

export default new WCUnivapaySettingPage()
