import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useSelect, select } from '@wordpress/data';
import { getSetting } from '@woocommerce/settings';
import { registerPaymentMethod } from '@woocommerce/blocks-registry';

import { useEffect, useRef, useState } from 'react';
import UnivapayComponent from '@components/univapay';

const settings = getSetting('upfw_data', {});
const { CHECKOUT_STORE_KEY } = window.wc.wcBlocksData;

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
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState(emailFromStore);
    const [phone, setPhone] = useState(phoneFromStore);
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

    const phoneFromStore = useSelect((select) => {
        const store = select('wc/store/cart');
        const customer = store.getCustomerData();
        return customer.billingAddress.phone;
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
        const store = select( CHECKOUT_STORE_KEY );
        return store.getOrderId();
    });

    const univapaySubmit = () => {
        return new Promise((resolve, reject) => {
            const iFrame = document.getElementById('upfw_checkout').querySelector('iframe');
            if (iFrame) {
                UnivapayCheckout.submit(iFrame)
                .then((res) => {
                    univapayOptionalRef.current = 'false';
                    univapayChargeIdRef.current = res.charge;
                    resolve(null);
                })
                .catch((err) => reject(err));
            } else {
                reject(new Error('Univapay iframe not found.'));
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

        const univapayWidget = onPaymentSetup( async() => {

            const { validationStore } = window.wc?.wcBlocksData ?? {};
            if ( validationStore ) {
                const store = select( validationStore );
                const hasValidationErrors = store.hasValidationErrors();
                if ( hasValidationErrors ) {
                    return
                }
            }

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

        // remove when this component is unmounted
        return () => {
            if (paymentMethodElement)
                paymentMethodElement.removeEventListener('change', handlePaymentMethodChange);
            univapayWidget();
        };
    }, []);

    useEffect(() => {
        setEmail(emailFromStore);
        setPhone(phoneFromStore);
        setTotalPrice(totalPriceFromStore);
    }, [emailFromStore, phoneFromStore, totalPriceFromStore]);

    return (
        <>
            {decodeEntities(settings.description || '')}
            <UnivapayComponent
                isVisible={isVisible}
                amount={totalPrice}
                email={email}
                phone={phone}
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
