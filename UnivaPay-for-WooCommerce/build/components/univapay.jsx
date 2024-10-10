import React, { useImperativeHandle, forwardRef } from 'react';
import { getSetting } from '@woocommerce/settings';

const settings = getSetting('upfw_data', {});

const UnivapayComponent = forwardRef(({ isVisible, email, amount, orderId, optional }, ref) => {
    useImperativeHandle(ref, () => ({
        submit: () => {
            return new Promise((resolve, reject) => {
                const iFrame = document.querySelector("#upfw_checkout iframe");
                if (iFrame) {
                    resolve({ charge: 'charge_id_example' });
                } else {
                    reject(new Error('iFrame not found'));
                }
            });
        }
    }));

    if (!isVisible) {
        return null;
    }

    return (
        <>
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
        </>
    );
});

export default UnivapayComponent;
