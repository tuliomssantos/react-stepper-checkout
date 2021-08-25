export interface CheckoutContext {}

export type OrderSummaryState = {
  value: 'orderSummary'
  context: CheckoutContext
}

export type FinalizeState = {
  value: 'finalize'
  context: CheckoutContext
}

export type CheckoutState = OrderSummaryState | FinalizeState

export type Turn_Off = {
  type: 'PROCEED'
}

export type CheckoutEvent = Turn_Off
