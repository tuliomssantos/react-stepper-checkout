import { createMachine, assign } from 'xstate'

import {
  ApplyDiscountCoupon,
  CheckoutContext,
  // CheckoutEvent,
  // CheckoutState,
  // ApplyDiscountCoupon,
} from '../types/checkout'

type CheckoutServices = {
  validateDiscountCoupon: () => Promise<any>
  fetchAddresses: () => Promise<any>
}

export const createCheckoutMachine = (services: CheckoutServices) =>
  createMachine<CheckoutContext>(
    {
      id: 'checkoutMachine',
      initial: 'orderSummary',
      context: {
        discountCoupon: null,
      },
      states: {
        orderSummary: {
          initial: 'discountCouponNotEntered',
          states: {
            discountCouponNotEntered: {
              on: {
                APPLY_DISCOUNT_COUPON: {
                  target: 'validatingDiscountCoupon',
                  actions: 'registerDiscountCoupon',
                },
              },
            },

            validatingDiscountCoupon: {
              invoke: {
                src: 'validateDiscountCoupon',
                onDone: 'validDiscountCoupon',
                onError: 'inValidDiscountCoupon',
              },
            },

            validDiscountCoupon: {},

            inValidDiscountCoupon: {},
          },
          on: {
            PROCEED: 'finalize',

            GO_TO_MY_ADDRESSES: 'fetchingAddresses',
          },
        },

        fetchingAddresses: {
          invoke: {
            src: 'fetchAddresses',
            onDone: 'myAddresses',
            onError: 'fetchingAddressesError',
          },
        },

        fetchingAddressesError: {},

        myAddresses: {},

        finalize: {},
      },
    },
    {
      actions: {
        registerDiscountCoupon: assign<CheckoutContext, ApplyDiscountCoupon>({
          discountCoupon: (_context: any, event: { discountCoupon: string }) =>
            event.discountCoupon,
        }),
      },
      services: {
        ...services,
      },
    }
  )
