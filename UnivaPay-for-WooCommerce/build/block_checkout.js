import { __ } from '@wordpress/i18n';
import { registerPaymentMethod, registerCheckoutBlock } from '@woocommerce/blocks-registry';
import { decodeEntities } from '@wordpress/html-entities';
import { getSetting } from '@woocommerce/settings';
import { useEffect, useState, useRef } from 'react';

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
    const univapayTokenIdRef = useRef('');

    const redirectToUnivapay = () => {
        univapayOptionalRef.current = 'true';
        jQuery('button.wc-block-components-button.wp-element-button.wc-block-components-checkout-place-order-button.contained').click();
    }

    const isUnivapayGatewaySelected = () => {
        return jQuery('input[name="radio-control-wc-payment-method-options"]:checked').val() === 'upfw';
    };

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
            'data-checkout': "token",
            'data-token-type': "one_time",
            'data-inline': true,
            'data-email': getEmail(),
            'data-inline-item-style': 'padding: 0 2px',
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
        UnivapayCheckout.submit(iFrame)
            .then((res) => {
                univapayOptionalRef.current = 'false';
                univapayTokenIdRef.current = res.token;
                getPalaceOrderButton().click();
            })
            .catch((errors) => {
                alert("入力内容をご確認ください");
                console.error(errors);
            });
    }
    
    useEffect(() => {
        const params = {
			appId: settings.token,
            checkout: 'payment',
            formUrl: settings.formUrl,
        };
        jQuery(document).ready(function ($) {    
            if (isUnivapayGatewaySelected()) {
                initializeUnivapay(params);
            }

            jQuery('#payment-method').on('change', function () {
                if (isUnivapayGatewaySelected()) {                   
                    initializeUnivapay(params);
                } else {
                    removeUnivapay();
                    getPalaceOrderButton().show();
                }
            });
        });
        // this is a workaround to pass the univapay state to the server side
        // ref: https://github.com/woocommerce/woocommerce-blocks/blob/62243e1731a0773f51b81fb8406ebc2e8b180b40/docs/internal-developers/block-client-apis/checkout/checkout-api.md#passing-a-value-from-the-client-through-to-server-side-payment-processing
        onPaymentSetup( async() => {
            return {
                type: emitResponse.responseTypes.SUCCESS,
                meta: {
                    paymentMethodData: {
                        'univapay_optional' : univapayOptionalRef.current,
                        'univapay_token_id': univapayTokenIdRef.current,
                    }
                },
            }
        });
    }, []);

    return decodeEntities(settings.description || '');
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
	ariaLabel: label,
	supports: {
		features: settings.supports,
	}
};

registerPaymentMethod( UnivaPay );
