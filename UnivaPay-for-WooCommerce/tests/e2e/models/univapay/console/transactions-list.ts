import { Selector } from "testcafe"

class UnivapayConsoleTransactionsListPage {
    row = Selector('table[data-name="transaction-table"] tbody tr')

    async navigateToTransactionList(t: TestController, searchQuery: string) {
        await t
            .navigateTo(`/dashboard/transactions${searchQuery}`)
            .expect(this.row.exists).ok({ timeout: 15000 })
    }

    async confirmTransactionList(t: TestController) {
        await t
            .expect(this.row.count).eql(1)
    }

    async navigateToTransactionDetail(t: TestController) {
        await t
            .click(this.row.nth(0))
    }
}

export default new UnivapayConsoleTransactionsListPage()
