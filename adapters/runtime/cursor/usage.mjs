// The usage of Cursor (the runtime contract, role `usage`): a mock. No way for an agent to read the use of a Cursor account is known and verified, so the owner
// reads it, and the table has one invented subscription, `mock`, that spends one percent of each window per SP: enough to run the gate and the checks.

/** The usage of Cursor: the owner reads the windows; the table is a mock. */
export const usageFor = () => ({
  means:
    'the owner reads the use of the Cursor account; the coefficients are a mock (one percent of each window per SP)',
  read: () => [
    {
      via: 'the owner',
      owner: 'Ask the owner for the percent used and the reset time of each window of their Cursor account.'
    }
  ],
  plans: {},
  subscriptions: {
    mock: {
      label: 'a mock subscription',
      unit: 'percent',
      provisional: true,
      kinds: {},
      perSp: { default: { default: { fiveHour: 1, weekly: 1 } } }
    }
  },
  defaultModel: 'default'
})
