export const config = {
    wpUrl: 'http://localhost:' + (process.env.WP_PORT || '80'),
    univapayConsoleUrl: process.env.E2E_UNIVAPAY_ADMIN_CONSOLE_URL || '',
    univapayConsoleEmail: process.env.E2E_UNIVAPAY_ADMIN_EMAIL || '',
    univapayConsolePassword: process.env.E2E_UNIVAPAY_ADMIN_PASSWORD || '',
};
