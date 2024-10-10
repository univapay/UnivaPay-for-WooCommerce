import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useSelect } from '@wordpress/data';
import { getSetting } from '@woocommerce/settings';
import { registerPaymentMethod } from '@woocommerce/blocks-registry';

import { useEffect, useRef, useState } from 'react';
import UnivapayComponent from '@components/univapay';

const settings = getSetting('upfw_data', {});

const defaultLabel = __(
    'UnivaPay',
    'woo-gutenberg-products-block'
);

const Label = ( props ) => {
    const { PaymentMethodLabel } = props.components;
    return <PaymentMethodLabel text={ defaultLabel } />;
};

const Content = (props) => {
    const { eventRegistration, emitResponse } = props;
    const { onPaymentSetup } = eventRegistration;
    const univapayOptionalRef = useRef('false');
    const univapayChargeIdRef = useRef('');
    const UnivapayComponentRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState(emailFromStore);
    const [totalPrice, setTotalPrice] = useState(totalPriceFromStore);

    const rendering = () => {
        setIsVisible(isUnivapayGatewaySelected());
    };

    const isUnivapayGatewaySelected = () => {
        return jQuery('input[name="radio-control-wc-payment-method-options"]:checked').val() === 'upfw';
    };

    const handleOptionalClick = () => {
        univapayOptionalRef.current = 'true';
        jQuery('button.wc-block-components-button.wp-element-button.wc-block-components-checkout-place-order-button.contained').click();
    }

    const emailFromStore = useSelect((select) => {
        const store = select('wc/store/cart');
        const customer = store.getCustomerData();
        return customer.billingAddress.email;
    });
    
    const totalPriceFromStore = useSelect((select) => {
        const store = select('wc/store/cart');
        const cartTotalsData = store.getCartTotals();

        if (!cartTotalsData) {
            return 0;
        }

        const { total_price, currency_minor_unit } = cartTotalsData;
        return currency_minor_unit > 0 ? total_price / Math.pow(10, currency_minor_unit) : total_price; ;
    });

    const orderId = useSelect((select) => {
        const store = select('wc/store/checkout');
        return store.getOrderId();
    });

    const univapaySubmit = () => {
        return new Promise((resolve, reject) => {
            const submitButton = document.getElementById('univapay-submit-button');
            if (submitButton) {
                submitButton.click();
                resolve(null);
            } else {
                reject(new Error('Univapay submit button not found.'));
            }
        });
    };

    useEffect(() => {
        rendering();

        const handlePaymentMethodChange = () => {
            rendering();
        };

        const paymentMethodElement = document.getElementById('payment-method');
        if (paymentMethodElement)
            paymentMethodElement.addEventListener('change', handlePaymentMethodChange);

        return () => {
            if (paymentMethodElement)
                paymentMethodElement.removeEventListener('change', handlePaymentMethodChange);
        };
    }, []);

    useEffect(() => {
        setEmail(emailFromStore);
        setTotalPrice(totalPriceFromStore);
    }, [emailFromStore, totalPriceFromStore]);

    useEffect(() => {
        // this is a workaround to pass the univapay state to the server side
        // ref: https://github.com/woocommerce/woocommerce-blocks/blob/62243e1731a0773f51b81fb8406ebc2e8b180b40/docs/internal-developers/block-client-apis/checkout/checkout-api.md#passing-a-value-from-the-client-through-to-server-side-payment-processing
        onPaymentSetup( async() => {
            try {
                if (univapayOptionalRef.current !== 'true') {
                    await univapaySubmit();
                }
                return {
                    type: emitResponse.responseTypes.SUCCESS,
                    meta: {
                        paymentMethodData: {
                            'univapay_optional' : univapayOptionalRef.current,
                            'univapay_charge_id': univapayChargeIdRef.current,
                        }
                    },
                }
            } catch (error) {
                return {
                    type: emitResponse.responseTypes.ERROR,
                    message: `決済処理に失敗しました。再度お試しください。\nエラー: ${error.message}`
                }
            }
        });
    }, []); // Note: only need to run once, always empty array
    
    return (
        <>
            {decodeEntities(settings.description || '')}
            <UnivapayComponent
                isVisible={isVisible}
                amount={totalPrice}
                email={email}
                orderId={orderId}
                optional={handleOptionalClick}
            />
        </>
    );
};

/**
 * Univapay payment method config object.
 */
const UnivaPay = {
    name: "upfw",
    label: <Label />,
    content: <Content />,
    edit: <Content />,
    canMakePayment: () => true,
    ariaLabel: defaultLabel,
    supports: {
        features: settings.supports,
    }
};

registerPaymentMethod( UnivaPay );
