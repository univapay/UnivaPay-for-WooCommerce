import { Role } from 'testcafe'
import { config } from '../config'
import wpLoginPage from '../models/wp/login'
import univapayConsoleLoginPage from '../models/univapay/console/login'

export const wpAdmin = Role(`${config.wpUrl}/wp-login.php`, async t => {
    await t
        .typeText(wpLoginPage.user, 'admin')
        .typeText(wpLoginPage.password, 'admin')
        .click(wpLoginPage.submit)
}, { preserveUrl: true })

export const univapayConsoleUser = Role(`${config.univapayConsoleUrl}/login`, async t => {
    await t
        .typeText(univapayConsoleLoginPage.email, config.univapayConsoleEmail)
        .typeText(univapayConsoleLoginPage.password, config.univapayConsolePassword)
        .click(univapayConsoleLoginPage.submit)
}, { preserveUrl: true })
