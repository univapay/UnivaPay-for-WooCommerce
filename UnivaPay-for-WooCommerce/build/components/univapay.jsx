import React from 'react';
import { getSetting } from '@woocommerce/settings';

const settings = getSetting('upfw_data', {});

const UnivapayComponent = ({ isVisible, email, amount, orderId, optional }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div key={`${email}-${amount}`}>
            <div id="upfw_checkout">
                <span
                    data-app-id={settings.app_id}
                    data-checkout="payment"
                    data-email={email}
                    data-amount={amount}
                    data-capture={settings.capture}
                    data-currency={settings.currency}
                    data-inline="true"
                    data-inline-item-style="padding: 0 2px"
                    data-metadata={`order_id:${orderId}`}
                />
            </div>
            {settings.formUrl !== '' && (
                <a
                    type="button"
                    id="upfw_optional"
                    className="wc-block-components-button wp-element-button wc-block-components-checkout-place-order-button contained"
                    onClick={optional}
                >
                    その他決済
                </a>
            )}
        </div>
    );
};

export default UnivapayComponent;
