export interface CheckoutContext {
  discountCoupon: null | string
}

export type OrderSummaryState = {
  value: 'orderSummary'
  context: CheckoutContext
}

export type FinalizeState = {
  value: 'finalize'
  context: CheckoutContext
}

export type CheckoutState = OrderSummaryState | FinalizeState

export type ApplyDiscountCoupon = {
  type: 'APPLY_DISCOUNT_COUPON'
  discountCoupon: string
}

export type Proceed = {
  type: 'PROCEED'
}

export type GoToMyAddresses = {
  type: 'GO_TO_MY_ADDRESSES'
}

export type CheckoutEvent = Proceed | GoToMyAddresses | ApplyDiscountCoupon
