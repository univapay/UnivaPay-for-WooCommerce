<?php

if (! defined('ABSPATH')) {
    exit;
}

class WC_Univapay_Constants
{
    // WooCommerce related
    public const CHECKOUT_DRAFT_STATUS = 'checkout-draft';
    public const SESSION_ORDER_DRAFT_ID = 'draft_order_id';
    public const ORDER_AWAITING_PAYMENT = 'order_awaiting_payment';
}
