import { __ } from '@wordpress/i18n';
import { registerPaymentMethod } from '@woocommerce/blocks-registry';
import { decodeEntities } from '@wordpress/html-entities';
import { getSetting } from '@woocommerce/settings';
import { useEffect, useRef } from 'react';
import { useSelect } from '@wordpress/data';

const settings = getSetting( 'upfw_data', {} );

const defaultLabel = __(
	'UnivaPay',
	'woo-gutenberg-products-block'
);

const label = decodeEntities( settings.title ) || defaultLabel;

/**
 * Label component
 *
 * @param {*} props Props from payment API.
 */
const Label = ( props ) => {
	const { PaymentMethodLabel } = props.components;
	return <PaymentMethodLabel text={ label } />;
};

const Content = (props) => {
    const { eventRegistration, emitResponse } = props;
    const { onPaymentSetup } = eventRegistration;
    const univapayOptionalRef = useRef('false');
    const univapayChargeIdRef = useRef('');

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

    const initializeUnivapay = (params) => {        
        removeUnivapay();
        getPalaceOrderButton().hide();
    
        jQuery(".wc-block-checkout__actions.wp-block-woocommerce-checkout-actions-block").before(
            jQuery('<div></div>').attr({
                'id': 'upfw_checkout'
            })
        );
    
        jQuery('<span></span>').attr({
            'data-app-id': params.appId,
            'data-checkout': "payment",
            'data-email': getEmail(),
            'data-amount': totalOrder, 
            'data-capture': params.capture,
            'data-currency': params.currency,
            'data-inline': true,
            'data-inline-item-style': 'padding: 0 2px',
            'data-metadata': 'order_id:' + params.order_id,
        }).appendTo("#upfw_checkout");
        
        if(params.formUrl !== '') {
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
                console.error(errors);
            });
    }
    
    useEffect(() => {
        const params = {
			appId: settings.token,
            checkout: 'payment',
            capture: settings.capture,
            currency: settings.currency,
            formUrl: settings.formUrl,
            order_id: settings.order_id,
        };

        const isUnivapayGatewaySelected = () => {
            return jQuery('input[name="radio-control-wc-payment-method-options"]:checked').val() === 'upfw';
        };

        const updateUnivapay = () => {
            if (isUnivapayGatewaySelected()) {
                initializeUnivapay(params);
            } else {
                removeUnivapay();
                getPalaceOrderButton().show();
            }
        }

        jQuery(document).ready(function ($) {    
            updateUnivapay();
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

    return decodeEntities(settings.description || '');
};

// Add the loading spinner HTML to the body
document.body.insertAdjacentHTML('beforeend', `
    <div id="loading-spinner" style="display: none;">
        <div class="spinner"></div>
    </div>
`);

// Add the CSS for the loading spinner
const style = document.createElement('style');
style.innerHTML = `
    #loading-spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #000;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

/**
 * Univapay payment method config object.
 */
const UnivaPay = {
	name: "upfw",
	label: <Label />,
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
