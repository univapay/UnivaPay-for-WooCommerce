import React, { useImperativeHandle, forwardRef } from 'react';
import { getSetting } from '@woocommerce/settings';

const settings = getSetting('upfw_data', {});

const UnivapayComponent = forwardRef(({ isVisible, email, amount, orderId, optional }, ref) => {
    useImperativeHandle(ref, () => ({
        submit: () => {
            return new Promise((resolve, reject) => {
                const iFrame = document.querySelector("#upfw_checkout iframe");
                if (iFrame) {
                    UnivapayCheckout.submit(iFrame)
                    .then((res) => resolve(res))
                    .catch((errors) => reject(errors));
                } else {
                    reject(new Error('UnivaPay checkout not found'));
                }
            });
        }
    }));

    const handleSubmit = () => {
        const iFrame = document.querySelector("#upfw_checkout iframe");
        if (iFrame) {
            UnivapayCheckout.submit(iFrame)
                .then((res) => submitCallback(null, res))
                .catch((errors) => submitCallback(errors));
        } else {
            submitCallback(new Error('UnivaPay checkout not found'));
        }
    };

    return (
        <div key={`${email}-${amount}`} style={{ display: isVisible ? 'block' : 'none' }}>
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
            <button onClick={handleSubmit} style={{ display: 'none' }} id="univapay-submit-button"></button>
        </div>
    );
});

export default UnivapayComponent;
