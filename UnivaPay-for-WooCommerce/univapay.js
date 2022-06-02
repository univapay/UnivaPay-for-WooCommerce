function doCheckout(e) {
    var email = e.target.querySelector('#billing_email');
    var checkout = UnivapayCheckout.create({
        appId: univapay_params.token,
        checkout: "token",
        tokenType: "one_time",
        autoClose: true,
        email: email?.value,
        onSuccess: (result) => {
            token = document.createElement("input");
            token.type = "hidden";
            token.name = "charge_token";
            token.value = result.response.id;
            e.target.appendChild(token);
            var form = jQuery(e.target);
            form.off("checkout_place_order", doCheckout);
            form.submit();
            form.on("checkout_place_order", doCheckout);
        },
        onError: () => {
            alert("エラーが発生しました。サイト管理者にお問い合わせください。");
            return false;
        },
        closed: () => {
            return false;
        }
    });
    checkout.open();
    return false;
}
jQuery(document).ready(function($) {
    $('.woocommerce-checkout form').on("checkout_place_order", doCheckout);
});