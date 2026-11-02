// The type check of this repository, which has no types: every tracked module parses (`node --check`).
import { execFileSync, spawnSync } from 'node:child_process'

const files = execFileSync('git', ['ls-files', '*.mjs'], { encoding: 'utf8' }).split('\n').filter(Boolean)
const failed = files.filter((file) => spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' }).status !== 0)

if (failed.length) {
  console.error(`${failed.length} module(s) do not parse: ${failed.join(', ')}`)
  process.exit(1)
}
console.log(`Checked that ${files.length} modules parse.`)
