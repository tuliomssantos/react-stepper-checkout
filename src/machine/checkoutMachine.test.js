import { createModel } from '@xstate/test'
import { createMachine, assign, StateMachine, State } from 'xstate'
import { createCheckoutMachine } from './checkoutMachine'

const eventConfigs = {
  PROCEED: {
    exec: async ({
      stateMachine,
      shared: { currentState },
      setCurrentState,
    }) => {
      setCurrentState(
        stateMachine.transition(currentState, {
          type: 'PROCEED',
        })
      )
    },
  },

  APPLY_DISCOUNT_COUPON: {
    exec: async ({
      stateMachine,
      shared: { currentState },
      setCurrentState,
      setValidatingDiscountCouponCallbacks,
      validateDiscountCouponMock,
    }) => {
      const validateDiscountCouponPromise = new Promise((resolve, reject) => {
        setValidatingDiscountCouponCallbacks({ resolve, reject })
      }).catch(() => {}) // Use catch to satisfy UnhandledPromiseRejectionWarning

      validateDiscountCouponMock.mockReturnValueOnce(
        validateDiscountCouponPromise
      )

      setCurrentState(
        stateMachine.transition(currentState, {
          type: 'APPLY_DISCOUNT_COUPON',
        })
      )
    },
  },

  'done.invoke.validateDiscountCoupon': {
    exec: async ({
      stateMachine,
      shared: { currentState, validatingDiscountCouponCallbacks },
      setCurrentState,
    }) => {
      if (validatingDiscountCouponCallbacks) {
        validatingDiscountCouponCallbacks.resolve()

        setCurrentState(
          stateMachine.transition(currentState, {
            type: 'done.invoke.validateDiscountCoupon',
          })
        )
      }
    },
  },

  'error.platform.validateDiscountCoupon': {
    exec: async ({
      stateMachine,
      shared: { currentState, validatingDiscountCouponCallbacks },
      setCurrentState,
    }) => {
      if (validatingDiscountCouponCallbacks) {
        validatingDiscountCouponCallbacks.reject(new Error())

        setCurrentState(
          stateMachine.transition(currentState, {
            type: 'error.platform.validateDiscountCoupon',
          })
        )
      }
    },
  },
}

const orderSummary_discountCouponNotEntered_test = {
  test: ({ shared: { currentState } }) => {
    expect(currentState.value).toMatchObject({
      orderSummary: 'discountCouponNotEntered',
    })
  },
}

const orderSummary_validatingDiscountCoupon_test = {
  test: ({ shared: { currentState } }) => {
    expect(currentState.value).toMatchObject({
      orderSummary: 'validatingDiscountCoupon',
    })
  },
}

const orderSummary_validDiscountCoupon_test = {
  test: ({ shared: { currentState } }) => {
    expect(currentState.value).toMatchObject({
      orderSummary: 'validDiscountCoupon',
    })
  },
}

const orderSummary_inValidDiscountCoupon_test = {
  test: ({ shared: { currentState } }) => {
    expect(currentState.value).toMatchObject({
      orderSummary: 'inValidDiscountCoupon',
    })
  },
}

const finalizeTest = {
  test: ({ shared: { currentState } }) => {
    expect(currentState.value).toBe('finalize')
  },
}

describe('Checkout Machine', () => {
  describe('matches all paths', () => {
    const testMachine = createMachine({
      id: 'checkoutMachine',
      initial: 'orderSummary_discountCouponNotEntered',
      states: {
        orderSummary_discountCouponNotEntered: {
          on: {
            APPLY_DISCOUNT_COUPON: 'orderSummary_validatingDiscountCoupon',
            PROCEED: 'finalize',
          },
        },

        orderSummary_validatingDiscountCoupon: {
          invoke: {
            src: 'validateDiscountCoupon',
            onDone: 'orderSummary_validDiscountCoupon',
            onError: 'orderSummary_inValidDiscountCoupon',
          },
        },

        orderSummary_validDiscountCoupon: {},

        orderSummary_inValidDiscountCoupon: {},

        finalize: {},
      },
    })

    testMachine.states.orderSummary_discountCouponNotEntered.meta = {
      ...orderSummary_discountCouponNotEntered_test,
    }

    testMachine.states.orderSummary_validatingDiscountCoupon.meta = {
      ...orderSummary_validatingDiscountCoupon_test,
    }

    testMachine.states.orderSummary_validDiscountCoupon.meta = {
      ...orderSummary_validDiscountCoupon_test,
    }

    testMachine.states.orderSummary_inValidDiscountCoupon.meta = {
      ...orderSummary_inValidDiscountCoupon_test,
    }

    testMachine.states.finalize.meta = {
      ...finalizeTest,
    }

    const testModel = createModel(testMachine).withEvents(eventConfigs)

    const testPlans = testModel.getSimplePathPlans()

    testPlans.forEach((plan) => {
      describe(plan.description, () => {
        plan.paths.forEach((path) => {
          it(path.description, async () => {
            const validateDiscountCouponMock = jest.fn()

            const stateMachine = createCheckoutMachine({
              validateDiscountCoupon: validateDiscountCouponMock,
            })

            const shared = { currentState: stateMachine.initialState }

            const setCurrentState = (state) => {
              shared.currentState = state
            }

            const setValidatingDiscountCouponCallbacks = (
              validatingDiscountCouponCallbacks
            ) => {
              shared.validatingDiscountCouponCallbacks = validatingDiscountCouponCallbacks
            }

            await path.test({
              stateMachine,
              shared,
              setCurrentState,
              setValidatingDiscountCouponCallbacks,
              validateDiscountCouponMock,
            })
          })
        })
      })
    })
  })
})
