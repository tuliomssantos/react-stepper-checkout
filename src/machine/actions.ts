import { CheckoutContext, ApplyDiscountCoupon } from './../types/checkout'
import { assign } from 'xstate'

export const actions = {
  registerDiscountCoupon: assign<CheckoutContext, ApplyDiscountCoupon>({
    discountCoupon: (_context: any, event: { discountCoupon: string }) =>
      event.discountCoupon,
  }),
}
