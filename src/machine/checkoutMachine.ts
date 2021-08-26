import { createMachine } from 'xstate'

// import {
//   CheckoutContext,
//   CheckoutEvent,
//   CheckoutState,
// } from '../types/checkout'

type CheckoutServices = {
  validateDiscountCoupon: () => Promise<any>
  fetchAddresses: () => Promise<any>
}

export const createCheckoutMachine = (services: CheckoutServices) =>
  createMachine(
    {
      id: 'checkoutMachine',
      initial: 'orderSummary',
      // context: {
      //   discountCoupon: null,
      // },
      states: {
        orderSummary: {
          initial: 'discountCouponNotEntered',
          states: {
            discountCouponNotEntered: {
              on: {
                APPLY_DISCOUNT_COUPON: 'validatingDiscountCoupon',
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

            fetchingAddressesModalError: {},
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
            onError: 'orderSummary.fetchingAddressesModalError',
          },
        },

        myAddresses: {},

        finalize: {},
      },
    },
    {
      services: {
        ...services,
      },
    }
  )

/*
TO-DO: 
Implement action to store discount Coupon on context
*/
