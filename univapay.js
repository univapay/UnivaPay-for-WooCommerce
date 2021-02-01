function settoken(response) {
    if (response.resultCode !== "000" && response.resultCode !== 0) {
        window.alert('Error: ' + getResultCodeDetail(response.resultCode, univapay_params.lang));
    } else {
        var checkout_form = jQuery('form.woocommerce-checkout');
        // add a token to our hidden input field
        checkout_form.find('#upcmemberid').val(response.tokenObject.token);
        // deactivate the tokenRequest function event
        checkout_form.off('checkout_place_order', tokenRequest);
        // submit the form now
        checkout_form.submit();
        // Reactivate in case of payment failure
        jQuery('form.woocommerce-checkout').on('checkout_place_order', tokenRequest);
    }
}
function tokenRequest() {
    cardno = document.getElementById('cardno').value.replace(/\s+/g, "");
    expire = document.getElementById('expire').value.replace(/[\s\/]+/g, "");
    securitycode = document.getElementById('securitycode').value;
    holderfirstname = document.getElementById('billing_first_name').value;  
    holderlastname = document.getElementById('billing_last_name').value;  
    email = document.getElementById('billing_email').value;  
    phonenumber = document.getElementById('billing_phone').value;  
    Multipayment.init(univapay_params.publishableKey);
    Multipayment.getMember({
        cardno: cardno, //カード番号
        securitycode: securitycode, //セキュリティコード
        expire: expire, //カード有効期限
        holderfirstname: holderfirstname, //カードホルダー名
        holderlastname: holderlastname, //カードホルダー姓
        membercode: univapay_params.user_ID == 0 ? null : univapay_params.user_ID, //会員コード
        email: email, //メール
        phonenumber: phonenumber //電話番号
    }, settoken);
    return false;
}
jQuery(document).ready(function(){
    jQuery('form.woocommerce-checkout').on('checkout_place_order', tokenRequest);
});