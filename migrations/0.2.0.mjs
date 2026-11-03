// Migration to 0.2.0 (task 3.10): the open phases of the project's plan become folders (a phase index, a file per task, the logs beside them). A phase
// that is a folder already, and a finished phase, are left as they are, so the script can run twice.
import { splitPhases } from '../tools/lib/phase-split.mjs'

export default ({ root, profile }) => splitPhases({ root, profile, numbers: null }).messages
