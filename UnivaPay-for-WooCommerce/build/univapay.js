var isRendering = false;

function selected() {
    return jQuery('#payment_method_upfw').prop('checked');
}

function validateCheckout() {
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            type: 'POST',
            url: wc_checkout_params.checkout_url,
            data: jQuery('form.woocommerce-checkout').serialize() + '&validation_only=true',
            dataType: 'json',
            success: function(response) {
                if (response.result === "success") {
                    // validation passed
                    resolve(true);
                } else {
                    resolve(false);
                }
            },
            error: function(xhr, status, error) {
                console.error('AJAX error:', status, error);
                reject(error);
            }
        });
    });
}

function isPayForOrderPage() {
    return window.location.href.includes('pay_for_order');
}

function doCheckout() {
    // clear before token
    document.querySelectorAll('[name="univapayChargeId"]').forEach(function(v) {
        v.parentNode.removeChild(v);
    });
    var iFrame = document.querySelector("#upfw_checkout iframe");

    // TODO: split pay for order and checkout page logic
    // pay for order page (myaccount)
    if (isPayForOrderPage()) {
        // skip validation, as it's already done
        UnivapayCheckout.submit(iFrame)
            .then(() => {
                document.querySelector('#place_order').click();
            })
            .catch((errors) => {
                alert(`決済処理に失敗しました。再度お試しください。\nエラー: ${errors.message}`);
            });
    } else {
        // checkout page
        validateCheckout().then((res) => {
            if (res) {
                UnivapayCheckout.submit(iFrame)
                    .then(() => {
                        // continue process order
                        document.querySelector('#place_order').click();
                    })
                    .catch((errors) => {
                        alert(`決済処理に失敗しました。再度お試しください。\nエラー: ${errors.message}`);
                    });
            } else {
                // show error messages by calling the place order button, will call the same wc-ajax=checkout again
                document.querySelector('#place_order').click();
            }
        }).catch((error) => {
            console.error('システムエラー・エラ：', error.messages);
        });
    }
}

function optional() {
    jQuery('<input>').attr({
        'type': 'hidden',
        'name': 'univapay_optional',
        'value': 'true'
    }).appendTo('form.woocommerce-checkout');
    jQuery('#place_order').click();
}

function getEmail() {
    return jQuery("#billing_email").val();
}

async function fetchOrderSession() {
    try {
        const response = await fetch('/index.php?rest_route=/univapay/v1/order/session');
        if (!response.ok) {
            throw new Error('システムエラーが発生しました。');
        }
        return await response.json();
    } catch (error) {
        console.error('failed fetching order session: ', error);
        alert('予期しないエラーが発生しました。後ほど再試行してください。');
        return null;
    }
}

async function render() {
    if (isRendering) return;
    isRendering = true;


    if (isPayForOrderPage()) {
        jQuery("#place_order").before(
            jQuery('<div></div>').attr({
                'id': 'upfw_checkout'
        }));
        jQuery('<span></span>').attr({
            'data-app-id': univapay_params.app_id,
            'data-checkout': "payment",
            'data-email': getEmail(),
            'data-amount': univapay_params.total,
            'data-capture': univapay_params.capture,
            'data-currency': univapay_params.currency,
            'data-inline': true,
            'data-metadata': 'order_id:' + univapay_params.order_id,
            'data-inline-item-style': 'padding: 0 2px',
        }).appendTo("#upfw_checkout");
    } else {
        const orderSession = await fetchOrderSession();
        if (!orderSession) {
            return;
        }

        jQuery("#place_order").before(
            jQuery('<div></div>').attr({
                'id': 'upfw_checkout'
        }));
        jQuery('<span></span>').attr({
            'data-app-id': univapay_params.app_id,
            'data-checkout': "payment",
            'data-email': getEmail(),
            'data-amount': orderSession.total,
            'data-capture': univapay_params.capture,
            'data-currency': univapay_params.currency,
            'data-inline': true,
            'data-metadata': 'order_id:' + orderSession.order_id,
            'data-inline-item-style': 'padding: 0 2px',
        }).appendTo("#upfw_checkout");
    }

    jQuery("#place_order").after(
        jQuery('<a>注文する</a>').attr({
            type: 'button',
            id: 'upfw_order',
            class: 'button wp-element-button',
        }).css({
            'width': '100%',
            'box-sizing': 'border-box',
            'line-height': '1.2'
        }).on("click", doCheckout));
    if(univapay_params.formurl !== '') {
        jQuery("#place_order").after(
            jQuery('<a>その他決済</a>').attr({
                type: 'button',
                id: 'upfw_optional',
                class: 'button wp-element-button',
            }).css({
                'width': '100%',
                'box-sizing': 'border-box',
                'line-height': '1.2'
            }).on("click", optional));
    }
    isRendering = false;
}

function checkSelect() {
    jQuery("#place_order").hide();
    jQuery("#upfw_checkout").remove();
    jQuery("#upfw_order").remove();
    jQuery("#upfw_optional").remove();
    if(selected()) {
        render();
    } else {
        jQuery("#place_order").show();
    }
}

jQuery(document).ready(function($) {
    $(document.body).on("updated_checkout payment_method_selected", checkSelect);
});
