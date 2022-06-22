function doCheckout() {
    // clear before token
    document.querySelectorAll('[name="univapayTokenId"]').forEach(function(v) {
        v.parentNode.removeChild(v);
    });
    var iFrame = document.querySelector("#upfw_checkout iframe");
    UnivapayCheckout.submit(iFrame)
        .then(() => {
            document.querySelector('#place_order').click();
        })
        .catch((errors) => {
            alert("入力内容をご確認ください");
            console.error(errors);
        });
}
function optional() {
    jQuery('<input>').attr({
        'type': 'hidden',
        'name': 'univapayOptional',
        'value': 'true'
    }).appendTo('form.woocommerce-checkout');
    jQuery('#place_order').click();
}
function createForm() {
    jQuery("#upfw_card").remove();
    jQuery('<div></div>').attr({
        'id': 'upfw_checkout'
    }).appendTo(".place-order");
    jQuery('<span></span>').attr({
        'data-app-id': univapay_params.token,
        'data-checkout': "token",
        'data-token-type': "one_time",
        'data-inline': true,
        'data-email': getEmail(),
        'data-inline-item-style': 'padding: 0 2px',
    }).appendTo("#upfw_checkout");
    jQuery('<a>注文する</a>').attr({
        type: 'button',
        id: 'upfw_order',
        class: 'button',
    }).css({
        'width': '100%',
        'box-sizing': 'border-box',
        'line-height': '1.2'
    }).on("click", doCheckout).appendTo(".place-order");
}
function getEmail() {
    return jQuery("#billing_email").val();
}
function checkSelect() {
    jQuery("#place_order").show();
    jQuery("#upfw_card").remove();
    jQuery("#upfw_optional").remove();
    if(selected()) {
        render();
    }
}
function render() {
    jQuery("#place_order").hide();
    if(jQuery('#upfw_order').length !== 0)
        return;
    if(univapay_params.formurl !== '') {
        jQuery('<a>その他決済</a>').attr({
            type: 'button',
            id: 'upfw_optional',
            class: 'button',
        }).css({
            'width': '100%',
            'box-sizing': 'border-box',
            'line-height': '1.2'
        }).on("click", optional).appendTo(".place-order");
    }
    jQuery('<a>カード決済</a>').attr({
        type: 'button',
        id: 'upfw_card',
        class: 'button',
    }).css({
        'width': '100%',
        'box-sizing': 'border-box',
        'line-height': '1.2'
    }).on("click", createForm).appendTo(".place-order");
}
function selected() {
    return jQuery('#payment_method_upfw').prop('checked');
}
function payfororder(e) {
    if(!selected())
        return;
    e.preventDefault();
    var checkout = UnivapayCheckout.create({
        appId: univapay_params.token,
        checkout: 'payment',
        amount: univapay_params.total,
        currency: univapay_params.currency,
        email: univapay_params.email,
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