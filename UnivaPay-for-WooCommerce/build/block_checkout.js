import { __ } from '@wordpress/i18n';
import { registerPaymentMethod } from '@woocommerce/blocks-registry';
import { decodeEntities } from '@wordpress/html-entities';
import { useEffect, useRef, useState } from 'react';
import { useSelect } from '@wordpress/data';
import './univapay.css';

const defaultLabel = __(
    'UnivaPay',
    'woo-gutenberg-products-block'
);

/**
 * Label component
 *
 * @param {*} props Props from payment API.
 */
const Label = ( props ) => {
    const { PaymentMethodLabel } = props.components;
    return <PaymentMethodLabel text={props.settings.title || defaultLabel} />;
};

const Content = (props) => {
    const { eventRegistration, emitResponse } = props;
    const { onPaymentSetup } = eventRegistration;
    const univapayOptionalRef = useRef('false');
    const univapayChargeIdRef = useRef('');
    const [settings, setSettings] = useState({});

    const fetchSettings = async () => {
        try {
            const response = await jQuery.ajax({
                url: '/wp-admin/admin-ajax.php',
                method: 'POST',
                data: {
                    action: 'get_univapay_settings',
                }
            })
            if (response.success) {
                setSettings(response.data);
            } else {
                alert('UnivaPayの設定の取得に失敗しました。後ほど再度お試しください。');
                console.error('Error fetching settings:', response);
            }

        } catch (error) {
            alert('予期しないエラーが発生しました。後ほど再度お試しください。');
            console.error('Error fetching settings:', error);
        }
    };

    const redirectToUnivapay = () => {
        univapayOptionalRef.current = 'true';
        jQuery('button.wc-block-components-button.wp-element-button.wc-block-components-checkout-place-order-button.contained').click();
    }

    const removeUnivapay = () => {
        jQuery('#upfw_checkout').remove();
        jQuery('#upfw_order').remove();
        jQuery('#upfw_optional').remove();
    };
    
    const getEmail = () => {
        return jQuery('#email').val();
    }
    
    const getPalaceOrderButton = () => {
        return jQuery('button.wc-block-components-button.wp-element-button.wc-block-components-checkout-place-order-button.contained');
    }

    const totalOrder = useSelect((select) => {
        const store = select('wc/store/cart');
        return store.getCartTotals() ? store.getCartTotals().total_price : 0;
    });

    const initializeUnivapay = () => {
        removeUnivapay();
        getPalaceOrderButton().hide();
    
        jQuery(".wc-block-checkout__actions.wp-block-woocommerce-checkout-actions-block").before(
            jQuery('<div></div>').attr({
                'id': 'upfw_checkout'
            })
        );
    
        jQuery('<span></span>').attr({
            'data-app-id': settings.token,
            'data-checkout': "payment",
            'data-email': getEmail(),
            'data-amount': totalOrder, 
            'data-capture': settings.capture,
            'data-currency': settings.currency,
            'data-inline': true,
            'data-inline-item-style': 'padding: 0 2px',
            'data-metadata': 'order_id:' + settings.order_id,
        }).appendTo("#upfw_checkout");
        
        if(settings.formUrl !== '') {
            jQuery(".wc-block-checkout__actions_row").append(
                jQuery('<a>その他決済</a>').attr({
                    type: 'button',
                    id: 'upfw_optional',
                    class: 'wc-block-components-button wp-element-button wc-block-components-checkout-place-order-button contained',
                }).on("click", redirectToUnivapay));
        }

        jQuery(".wc-block-checkout__actions_row").append(
            jQuery('<a>注文する</a>').attr({
                type: 'button',
                id: 'upfw_order',
                class: 'wc-block-components-button wp-element-button wc-block-components-checkout-place-order-button contained',
            }).on("click", doCheckout));
    };

    const doCheckout = () => {
        // clear before token
        document.querySelectorAll('[name="univapayTokenId"]').forEach(function(v) {
            v.parentNode.removeChild(v);
        });
        var iFrame = document.querySelector("#upfw_checkout iframe");
        
        showLoadingSpinner();
        UnivapayCheckout.submit(iFrame)
            .then((res) => {
                hideLoadingSpinner();
                univapayOptionalRef.current = 'false';
                univapayChargeIdRef.current = res.charge;
                getPalaceOrderButton().click();
            })
            .catch((errors) => {
                hideLoadingSpinner();
                alert("入力内容をご確認ください");
                console.error('failed to submit checkout', errors);
            });
    }
    
    useEffect(() => {
        const isUnivapayGatewaySelected = () => {
            return jQuery('input[name="radio-control-wc-payment-method-options"]:checked').val() === 'upfw';
        };

        const updateUnivapay = async () => {
            if (isUnivapayGatewaySelected()) {
                await fetchSettings();
            } else {
                removeUnivapay();
                getPalaceOrderButton().show();
            }
        }

        jQuery(document).ready(async function ($) {    
            await fetchSettings();
            jQuery('#payment-method').on('change', updateUnivapay);
        });
        
        // this is a workaround to pass the univapay state to the server side
        // ref: https://github.com/woocommerce/woocommerce-blocks/blob/62243e1731a0773f51b81fb8406ebc2e8b180b40/docs/internal-developers/block-client-apis/checkout/checkout-api.md#passing-a-value-from-the-client-through-to-server-side-payment-processing
        onPaymentSetup( async() => {
            return {
                type: emitResponse.responseTypes.SUCCESS,
                meta: {
                    paymentMethodData: {
                        'univapay_optional' : univapayOptionalRef.current,
                        'univapay_charge_id': univapayChargeIdRef.current,
                    }
                },
            }
        });
    }, [totalOrder]);

    useEffect(() => {
        if (Object.keys(settings).length > 0) {
            initializeUnivapay();
        }
    }, [settings]);

    return decodeEntities(settings.description || '');
};

// Add the loading spinner HTML to the body
document.body.insertAdjacentHTML('beforeend', `
    <div id="loading-spinner" style="display: none;">
        <div class="spinner"></div>
    </div>
`);

/**
 * Univapay payment method config object.
 */
const UnivaPay = {
    name: "upfw",
    label: <Label settings={settings} />,
    content: <Content />,
    edit: <Content />,
    canMakePayment: () => true,
    ariaLabel: label,
    supports: {
        features: settings.supports,
    }
};

registerPaymentMethod( UnivaPay );

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}
