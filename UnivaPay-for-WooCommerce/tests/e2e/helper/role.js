import { Role } from 'testcafe'

export const admin = Role('http://localhost:3080/wp-admin/', async t => {
    await t
        .typeText('#user_login', 'admin')
        .typeText('#user_pass', 'admin')
        .click('#wp-submit')
});
