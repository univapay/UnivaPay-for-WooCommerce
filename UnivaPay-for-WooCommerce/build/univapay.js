jQuery(function ($) {

    const $form = $('form.checkout');
    
    function stateUnivapay(key, value) {
        if (typeof value === 'undefined') {
            return $form.data(`upfw-${key}`);
        }
        $form.data(`upfw-${key}`, value);
    }

    $form.on('checkout_place_order_upfw', async function () {
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

        try {
            const result = await UnivapayCheckout.submit(iframe);
            stateUnivapay('complete', true);
            stateUnivapay('processing', false);
            $form.trigger('submit');
        } catch (error) {
            stateUnivapay('processing', false);
            wc_add_notice?.(
                error.message || '決済処理に失敗しました。',
                'error'
            );
        }

        return false;
    });

});
