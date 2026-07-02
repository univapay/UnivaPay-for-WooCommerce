jQuery(function ($) {
    const $form = $('form.checkout, form#order_review');
    
    // Wait for the univapayChargeId input to be added to the DOM
    function waitForUnivapayChargeId(timeout = 10000) {
        const selector = 'input[name="univapayChargeId"]';

        return new Promise((resolve, reject) => {
            const existing = document.querySelector(selector);
            if (existing) return resolve(existing);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    resolve(el);
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error('Timeout: univapayChargeId not found'));
            }, timeout);
        });
    }
    
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

    // classic checkout form submission handler
    $form.on('checkout_place_order_upfw', function (event) {
        if ($('#univapay_optional').val() === 'true') {
            return true; // Allow form submission for optional payment method
        }

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
            .then(async (res) => {
                await waitForUnivapayChargeId();
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
    
    // order-pay page form submission handler
    $('button#place_order').on('click', function (event) {
        const selectedPayment = $('input[name="payment_method"]:checked').val();
        if (selectedPayment && selectedPayment !== 'upfw') {
            return true;
        }

        if ($('#univapay_optional').val() === 'true') {
            return true;
        }

        event.preventDefault();

        $('button[type="submit"]').prop('disabled', true);

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
        $('button#univapay_optional_button').prop('disabled', true);

        UnivapayCheckout.submit(iframe)
            .then(async (res) => {
                await waitForUnivapayChargeId();
                stateUnivapay('complete', true);
                $('form#order_review').trigger('submit');
            })
            .catch((error) => {
                alert('決済処理に失敗しました。エラー: ' + error.message);
            })
            .finally(() => {
                stateUnivapay('processing', false);
                $('button#univapay_optional_button').prop('disabled', false);
                $('button[type="submit"]').prop('disabled', false);
            });

        return false;
    });
});
