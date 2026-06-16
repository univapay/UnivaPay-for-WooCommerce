jQuery(function ($) {
    const $form = $('form.checkout');
    
    function stateUnivapay(key, value) {
        if (typeof value === 'undefined') {
            return $form.data(`upfw-${key}`);
        }
        $form.data(`upfw-${key}`, value);
    }
    
    $form.on('click', '#univapay_optional_button', function (event) {
        event.preventDefault();
        $('#univapay_optional').val('true');
        $form.trigger('submit');
    });

    $form.on('checkout_place_order_upfw', function (event) {
        event.preventDefault();

        $('#place_order').prop('disabled', true);

        // prevent multiple submissions
        if (stateUnivapay('complete')) {
            return true;
        }

        if (stateUnivapay('processing')) {
            return false;
        }

        const iframe = document.querySelector('#upfw_checkout iframe');
        if (!iframe) {
            console.error('Univapay iframe not found.');
            return false;
        }

        stateUnivapay('processing', true);

        UnivapayCheckout.submit(iframe)
            .then(() => {
                stateUnivapay('complete', true);
                $form.trigger('submit');
            })
            .catch((error) => {
                alert('決済処理に失敗しました。エラー: ' + error.message);
            })
            .finally(() => {
                stateUnivapay('processing', false);
                $('#place_order').prop('disabled', false);
            });

        return false;
    });
});
