// The GitHub host adapter's remote state (task 5.8): the file of another repository and its pull requests, through the gh seam.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { remoteFile, remotePullRequests } from './remote.mjs'

const answer = (stdout, status = 0, stderr = '') => ({ status, stdout, stderr })
const file = (text) => JSON.stringify({ encoding: 'base64', content: Buffer.from(text).toString('base64') })

test('a file of the default branch is read through the contents API and decoded', () => {
  const seen = []
  const read = remoteFile({
    slug: 'acme/app',
    path: 'harness.lock.json',
    cli: (args) => (seen.push(args), answer(file('{"version":"1.0.0"}')))
  })
  assert.deepEqual(read, { found: true, text: '{"version":"1.0.0"}' })
  assert.deepEqual(seen[0], ['api', 'repos/acme/app/contents/harness.lock.json'])
})

test('a missing file is not an error; any other failure is returned, not thrown', () => {
  assert.deepEqual(remoteFile({ slug: 'a/b', path: 'x', cli: () => answer('', 1, 'gh: Not Found (HTTP 404)') }), {
    found: false
  })
  assert.deepEqual(remoteFile({ slug: 'a/b', path: 'x', cli: () => answer('', 1, 'gh: Bad credentials (HTTP 401)') }), {
    found: false,
    error: 'gh: Bad credentials (HTTP 401)'
  })
  assert.match(remoteFile({ slug: 'a/b', path: 'x', cli: () => answer('<html>') }).error, /answered no JSON/)
  assert.deepEqual(remoteFile({ slug: 'a/b', path: 'x', cli: () => answer(JSON.stringify([{ name: 'dir' }])) }), {
    found: false,
    error: 'not a file'
  })
})

test('the pull requests that mention a text come back with their state in lower case', () => {
  const seen = []
  const list = JSON.stringify([
    { number: 7, title: 'chore: take 1.0.0', url: 'https://github.com/acme/app/pull/7', state: 'OPEN' },
    { number: 5, title: 'chore: take 0.9.0', url: 'https://github.com/acme/app/pull/5', state: 'MERGED' }
  ])
  const found = remotePullRequests({ slug: 'acme/app', text: '1.0.0', cli: (args) => (seen.push(args), answer(list)) })
  assert.deepEqual(
    found.pullRequests.map((pr) => [pr.number, pr.state]),
    [
      [7, 'open'],
      [5, 'merged']
    ]
  )
  assert.deepEqual(seen[0].slice(0, 7), ['pr', 'list', '--repo', 'acme/app', '--state', 'all', '--search'])
  assert.equal(seen[0][7], '1.0.0')
  assert.deepEqual(remotePullRequests({ slug: 'a/b', text: 'x', cli: () => answer('', 1, 'no access') }), {
    pullRequests: [],
    error: 'no access'
  })
  assert.match(remotePullRequests({ slug: 'a/b', text: 'x', cli: () => answer('nope') }).error, /answered no JSON/)
})
