function doCheckout(e) {
    var checkout = UnivapayCheckout.create({
        appId: univapay_params.token,
        checkout: "token",
        tokenType: "one_time",
        autoClose: true,
        email: e.target.querySelector('#billing_email').value,
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
            alert("決済が中断されました");
            return false;
        }
    });
    checkout.open();
}
jQuery(document).ready(function($) {
    $('form.woocommerce-checkout').on("checkout_place_order", doCheckout);
});