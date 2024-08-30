function selected() {
    return jQuery('#payment_method_upfw').prop('checked');
}

function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

function doCheckout() {
    // clear before token
    document.querySelectorAll('[name="univapayTokenId"]').forEach(function(v) {
        v.parentNode.removeChild(v);
    });
    var iFrame = document.querySelector("#upfw_checkout iframe");
    showLoadingSpinner();
    UnivapayCheckout.submit(iFrame)
        .then(() => {
            hideLoadingSpinner();
            document.querySelector('#place_order').click();
        })
        .catch((errors) => {
            hideLoadingSpinner();
            alert("入力内容をご確認ください");
            console.error(errors);
        });
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
function render() {
    jQuery("#place_order").before(
        jQuery('<div></div>').attr({
            'id': 'upfw_checkout'
    }));
    jQuery('<span></span>').attr({
        'data-app-id': univapay_params.token,
        'data-checkout': "payment",
        'data-email': getEmail(),
        'data-amount': univapay_params.total,
        'data-capture': univapay_params.capture,
        'data-currency': univapay_params.currency,
        'data-inline': true,
        'data-metadata': 'order_id:' + univapay_params.order_id,
        'data-inline-item-style': 'padding: 0 2px',
    }).appendTo("#upfw_checkout");
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
}

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
function payfororder(e) {
    if(!selected())
        return;
    e.preventDefault();
    var checkout = UnivapayCheckout.create({
        appId: univapay_params.token,
        checkout: 'payment',
        email: univapay_params.email,
        amount: univapay_params.total,
        capture: univapay_params.capture,
        currency: univapay_params.currency,
        inline: true,
        metadata: 'order_id:' + univapay_params.order_id,
        onSuccess: (result) => {
            jQuery('<input>').attr({
                'type': 'hidden',
                'name': 'univapayChargeId',
                'value': result.response.id
            }).appendTo(e.target);
            jQuery(e.target).off("submit");
            e.target.submit();
            jQuery(e.target).on("submit", payfororder);
        },
        onError: () => {
            alert("エラーが発生しました。サイト管理者にお問い合わせください。");
            location.href = "";
        },
        closed: () => {
            alert("決済が中断されました");
            location.href = "";
        }
    });
    checkout.open();
}
jQuery(document).ready(function($) {
    $(document.body).on("updated_checkout payment_method_selected", checkSelect);
    $('#order_review').on("submit", payfororder);
});
