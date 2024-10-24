export const config = {
    wpUrl: 'http://localhost:' + (process.env.WP_PORT || '3080'),
    univapayConsoleUrl: process.env.E2E_UNIVAPAY_ADMIN_CONSOLE || '',
    univapayConsoleEmail: process.env.E2E_UNIVAPAY_ADMIN_EMAIL || '',
    univapayConsolePassword: process.env.E2E_UNIVAPAY_ADMIN_PASSWORD || '',
};
