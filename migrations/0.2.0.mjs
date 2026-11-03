// Migration to 0.2.0: (1) the open phases of the project's plan become folders (a phase index, a file per task, the logs beside them; task 3.10);
// (2) the open-ended phase becomes a normal phase and its defects that have not started become issues of the issue queue (task 3.13), and the profile file
// loses `plan.openEndedPhase` and `plan.openEndedPhaseNumber` and gains `paths.issues`. A phase that is a folder already, a finished phase and a profile
// file without the open-ended phase are left as they are, so the script can run twice.
import { convertOpenEndedPhase } from '../tools/lib/issue-migration.mjs'
import { splitPhases } from '../tools/lib/phase-split.mjs'
import { planSummary } from '../tools/lib/plan.mjs'
import { loadProfile } from '../tools/lib/profile.mjs'

export default ({ root, profile }) => {
  const messages = splitPhases({ root, profile, numbers: null }).messages
  const converted = convertOpenEndedPhase({ root, profile })
  if (converted.length) {
    planSummary({ root, profile: loadProfile(root) })
  }
  return [...messages, ...converted]
}
