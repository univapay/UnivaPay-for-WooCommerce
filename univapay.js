function settoken(response) {
    if (response.resultCode !== "000" && response.resultCode !== 0) {
        var lang = "ja";
        if (document.getElementById('lang') != null)  
            lang = document.getElementById('lang').value;
        window.alert('Error: ' + getResultCodeDetail(response.resultCode, lang));
    } else {
        var checkout_form = jQuery('form.woocommerce-checkout');
        // add a token to our hidden input field
        checkout_form.find('#upcmemberid').val(response.tokenObject.token);
        // deactivate the tokenRequest function event
        checkout_form.off('checkout_place_order', tokenRequest);
        // submit the form now
        checkout_form.submit();
    }
}
function tokenRequest() {
    cardno = document.getElementById('cardno').value;  
    securitycode = document.getElementById('securitycode').value;  
    expire = document.getElementById('expire_month').value + '' +  
    document.getElementById('expire_year').value;  
    holderfirstname = document.getElementById('holderfirstname').value;  
    holderlastname = document.getElementById('holderlastname').value;  
    email = document.getElementById('billing_email').value;  
    phonenumber = document.getElementById('billing_phone').value;  
    Multipayment.init(univapay_params.publishableKey); //当社発行の店舗ID  
    Multipayment.getMember({　//決済フォームより取得した情報  
        cardno: cardno, //カード番号  
        securitycode: securitycode, //セキュリティコード  
        expire: expire, //カード有効期限  
        holderfirstname: holderfirstname, //カードホルダー名  
        holderlastname: holderlastname, //カードホルダー姓  
        membercode: univapay_params.user_ID == 0 ? null : univapay_params.user_ID, //会員コード  
        email: email, //メール  
        phonenumber: phonenumber//電話番号  
    }, settoken);
    return false;
}
jQuery(document).ready(function(){
    jQuery('form.woocommerce-checkout').on('checkout_place_order', tokenRequest);
});