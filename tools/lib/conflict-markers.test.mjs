import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'
import { checkMarkers, markerLines } from './conflict-markers.mjs'

const dirs = []
after(() => dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

test('a line of 7 or more < or > characters at the start is a marker; a heading underline and a marker inside a line are not', () => {
  assert.deepEqual(markerLines('a\n<<<<<<< HEAD\nb\n=======\nc\n>>>>>>> develop\n'), [2, 6])
  assert.deepEqual(markerLines('<<<<<<<< HEAD:file\n>>>>>>>>\n'), [1, 2], 'a nested merge writes 8')
  assert.deepEqual(markerLines('Title\n=======\n\ntext `<<<<<<<` inline\n<<<<<< six\n'), [])
})

test('the check lists the tracked Markdown and JSON files that hold a marker, and not other files', () => {
  const root = mkdtempSync(join(tmpdir(), 'markers-'))
  dirs.push(root)
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  writeFileSync(join(root, 'ok.md'), 'Title\n=======\n')
  writeFileSync(join(root, 'bad.md'), 'x\n<<<<<<< HEAD\ny\n')
  writeFileSync(join(root, 'bad.json'), '>>>>>>> develop\n')
  writeFileSync(join(root, 'code.txt'), '<<<<<<< HEAD\n')
  execFileSync('git', ['add', '-A'], { cwd: root })
  const { problems, message } = checkMarkers({ root })
  assert.equal(problems.length, 2)
  assert.match(problems.join('\n'), /bad\.md: merge conflict marker at line 2/)
  assert.match(problems.join('\n'), /bad\.json: merge conflict marker at line 1/)
  assert.match(message, /Checked 3 Markdown and JSON files/)
})
