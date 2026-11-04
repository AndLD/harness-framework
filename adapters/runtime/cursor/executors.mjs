// The executors of Cursor (the runtime contract, role `executors`): a stub. No way for an agent to start, continue or measure another Cursor agent is known
// and verified, so Cursor offers no `session` and no `subagent` executor, and every step of a flow goes to the manual one: the owner pastes the prompt into
// an agent of their own and pastes back its full step report.

const manual = {
  means: 'the owner pastes the prompt into a Cursor agent of their own and pastes back its full step report',
  wakeups: false,
  cacheMinutes: 0,
  start: () => [
    {
      via: 'the owner',
      owner: "Give the owner the prompt to paste into a new agent in the step's repository, and wait for the report."
    }
  ],
  continue: () => [
    {
      via: 'the owner',
      owner: 'Give the owner the prompt to paste into the agent that ran the previous step, and wait for the report.'
    }
  ],
  report: () => [{ via: 'the owner', owner: 'Ask the owner to paste the whole step report, not a summary.' }],
  context: () => []
}

/** The executors of Cursor: the manual one only. */
export const executorsFor = () => ({ manual })
