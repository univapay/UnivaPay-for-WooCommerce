import { Selector } from "testcafe"

class UnivapayConsoleTransactionsListPage {
    row: Selector

    constructor() {
        this.row = Selector('table[data-name="transaction-table"] tbody tr')
    }
}

export default new UnivapayConsoleTransactionsListPage()
