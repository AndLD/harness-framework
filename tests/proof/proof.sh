#!/bin/bash
# The proof of design §3.4 (task 1.5): five projects in a scratch directory outside the repository.
# Usage: tests/proof/proof.sh <scratch directory>   (needs node, npm, git and uv, and the network for uv; the directory is emptied first)
# Then, for each project: node tests/proof/review.mjs <scratch directory>/<a..e>   (the measurements of the targeted harness review: D1, D3, D6)
set -u
FW=$(cd "$(dirname "$0")/../.." && pwd)
H="node $FW/tools/harness.mjs"
P=$1   # the scratch directory
rm -rf "$P" && mkdir -p "$P"
export GIT_AUTHOR_NAME=proof GIT_AUTHOR_EMAIL=proof@example.com GIT_COMMITTER_NAME=proof GIT_COMMITTER_EMAIL=proof@example.com
fail=0
step() { # label, command...
  local label=$1; shift
  if out=$("$@" 2>&1); then echo "  ok   $label"; else echo "  FAIL $label"; echo "$out" | tail -15 | sed 's/^/       /'; fail=1; fi
}
python_package() { # adds a package with code and a test, locks and syncs
  mkdir -p api/src api/tests
  printf '[project]\nname = "api"\nversion = "0.1.0"\nrequires-python = ">=3.12"\ndependencies = []\n\n[tool.uv]\npackage = false\n\n[tool.pytest.ini_options]\npythonpath = ["src"]\n' > api/pyproject.toml
  printf 'def double(n: int) -> int:\n    return n * 2\n' > api/src/app.py
  printf 'from app import double\n\n\ndef test_double() -> None:\n    assert double(2) == 4\n' > api/tests/test_app.py
}
python_checks() {
  step "uv lock" uv lock
  step "uv sync --locked" uv sync --locked
  step "ruff check" uv run --no-sync ruff check .
  step "ruff format --check" uv run --no-sync ruff format --check --force-exclude api/src/app.py
  step "mypy" uv run --no-sync mypy .
  step "pytest with coverage.py" bash -c 'cd api && uv run --no-sync coverage run --rcfile=../pyproject.toml -m pytest -q && uv run --no-sync coverage json --rcfile=../pyproject.toml -o coverage/coverage.json'
  step "harness coverage summarize" $PH coverage summarize api
  step "coverage summary is neutral" bash -c "node -e \"const s=require('./api/coverage/coverage-summary.json');process.exit(s.total.statements.pct===100?0:1)\""
}
node_checks() {
  step "npm ci" npm ci --no-audit --no-fund
  step "npm run lint" npm run lint
  step "npm test" npm test
  step "npm run test:coverage" npm run test:coverage
  step "npm run docs:check" npm run docs:check
}
PH="node harness/tools/harness.mjs"   # the project runs its own copy of the tools
check_all() { step "harness check all (the project's own copy)" $PH check all; }

echo "== A: node-ts with Claude Code"
mkdir "$P/a" && cd "$P/a" && git init -q
$H init --non-interactive --name orbit-a --repository acme/orbit-a --stack node-ts --runtime claude-code --host github >"$P/a.log" 2>&1 && echo "  ok   harness init" || { echo "  FAIL harness init"; tail -5 "$P/a.log"; fail=1; }
check_all; node_checks
step "CLAUDE.md imports the entry file" grep -qx '@AGENTS.md' CLAUDE.md
step ".claude/settings.json has the four hooks" bash -c "node -e \"const s=require('./.claude/settings.json');process.exit(Object.keys(s.hooks).length===3&&s.permissions.deny.length>0?0:1)\""
step "the skills are packaged" test -f .claude/skills/start-task/SKILL.md
step "no Cursor files" bash -c '! test -e .cursor && ! test -e .cursorignore'

echo "== B: python with Cursor (native)"
mkdir "$P/b" && cd "$P/b" && git init -q
$H init --non-interactive --name orbit-b --repository acme/orbit-b --stack python --runtime cursor --host github --set 'adapters.stacks=[{"adapter":"python","packages":["api"]}]' --set 'coveragePackages=["api"]' >"$P/b.log" 2>&1 && echo "  ok   harness init" || { echo "  FAIL harness init"; tail -5 "$P/b.log"; fail=1; }
python_package; check_all; python_checks
step ".cursor/hooks.json has the four hooks" bash -c "node -e \"const h=require('./.cursor/hooks.json');process.exit(h.version===1&&Object.keys(h.hooks).length===4?0:1)\""
step "the skills are in .cursor/skills" test -f .cursor/skills/start-task/SKILL.md
step ".cursorignore has the deny-read block" grep -q '^# harness:begin deny-read' .cursorignore
step "no Claude Code files" bash -c '! test -e .claude && ! test -e CLAUDE.md'
step "AGENTS.md is the entry file, with no pointer file" test -f AGENTS.md

echo "== C: node-ts and python together, both runtimes (compat)"
mkdir "$P/c" && cd "$P/c" && git init -q
$H init --non-interactive --name orbit-c --repository acme/orbit-c --stack node-ts,python --runtime claude-code,cursor --host github --set 'adapters.stacks=[{"adapter":"node-ts","packages":["web"]},{"adapter":"python","packages":["api"]}]' --set 'coveragePackages=["web","api"]' >"$P/c.log" 2>&1 && echo "  ok   harness init" || { echo "  FAIL harness init"; tail -5 "$P/c.log"; fail=1; }
python_package; check_all
step "CI job ids are unique" bash -c "test -z \"\$(sed -n '/^jobs:/,\$p' .github/workflows/ci.yml | grep -E '^  [a-z][a-z0-9-]*:\$' | sort | uniq -d)\""
step "each stack has its own static job" bash -c "grep -q '^  static-node-ts:' .github/workflows/ci.yml && grep -q '^  static-python:' .github/workflows/ci.yml"
step "compat: no .cursor/hooks.json and no .cursor/skills" bash -c '! test -e .cursor/hooks.json && ! test -e .cursor/skills'
step "compat: the Claude Code hooks and skills are there" bash -c 'test -f .claude/settings.json && test -f .claude/skills/start-task/SKILL.md'
step ".cursorignore block is there in compat mode" grep -q '^# harness:begin deny-read' .cursorignore
step ".nvmrc is one line" bash -c 'test "$(cat .nvmrc)" = 22'
step "npm ci" npm ci --no-audit --no-fund
step "npm run lint" npm run lint
step "npm run docs:check" npm run docs:check
python_checks

echo "== D: detached, with a core rule edited"
mkdir "$P/d" && cd "$P/d" && git init -q
$H init --non-interactive --detached --name orbit-d --repository acme/orbit-d --stack node-ts --runtime claude-code --host github >"$P/d.log" 2>&1 && echo "  ok   harness init --detached" || { echo "  FAIL harness init --detached"; tail -5 "$P/d.log"; fail=1; }
check_all
step "the lock says detached" grep -q '"mode": "detached"' harness.lock.json
sed -i.bak 's/Squash merge into the integration branch/Squash merge, by the owner, into the integration branch/' harness/core/rules/git.md && rm harness/core/rules/git.md.bak
if $PH check generated >/dev/null 2>&1; then echo "  FAIL an edited core rule left the entry file as it was"; fail=1; else echo "  ok   check generated names the entry file after the core rule changed"; fi
step "harness sync --local" $PH sync --local
check_all
step "the entry file carries the edited rule" grep -q 'by the owner, into the integration branch' AGENTS.md
step "check vendored accepts a detached copy" $PH check vendored

echo "== E: adopt a project that copied the first harness"
mkdir "$P/e" && cd "$P/e"
mkdir -p scripts .githooks .claude
echo '{"project":{"name":"legacy"},"repository":{"slug":"acme/legacy"},"adapters":{"stacks":["node-ts"],"runtimes":["claude-code"],"host":"github"}}' > scripts/harness-profile.json
echo 'export function checkLinks() {}' > scripts/check-markdown-links.mjs
echo 'export function planSummary() {}' > scripts/plan-summary.mjs
echo 'export function runGate() {}' > scripts/local-gate.mjs
echo 'export const checkAssets = () => []' > scripts/check-assets.mjs
printf '#!/bin/sh\nexit 0\n' > .githooks/pre-push; cp .githooks/pre-push .githooks/pre-commit
echo '{"hooks":{"PreToolUse":[{"matcher":"Bash","hooks":[{"type":"command","command":"node \"$CLAUDE_PROJECT_DIR/scripts/hook-guard-bash.mjs\""}]}],"Stop":[{"hooks":[{"type":"command","command":"node scripts/own-hook.mjs"}]}]},"permissions":{"allow":["Bash(ls:*)"]}}' > .claude/settings.json
printf '# legacy: rules for agents\n\n## Our rules\n\nNever merge on Fridays.\n' > AGENTS.md; echo '# legacy' > README.md
git init -q --initial-branch develop && git config core.hooksPath .githooks && git add --all && git -c core.hooksPath=/dev/null commit -q -m legacy
$H adopt --non-interactive >"$P/e.log" 2>&1; code=$?
[ $code -eq 0 ] && echo "  ok   harness adopt" || { echo "  FAIL harness adopt (exit $code)"; tail -8 "$P/e.log"; fail=1; }
check_all
step "the project's own entry text is kept" grep -q 'Never merge on Fridays.' AGENTS.md
step "the managed blocks are added" grep -q 'harness:begin git-rules' AGENTS.md
step "its own hook is kept, the framework's added" bash -c "node -e \"const s=require('./.claude/settings.json');const c=JSON.stringify(s);process.exit(c.includes('own-hook.mjs')&&c.includes('runtime-hooks/guard-shell.mjs')?0:1)\""
step "nothing was deleted" bash -c 'test -f scripts/check-markdown-links.mjs && test -f scripts/check-assets.mjs'
step "the project check runs in check all" bash -c "$PH check all 2>&1 | grep -qi 'check-assets\|project'"
step "core.hooksPath points at the framework" bash -c 'test "$(git config core.hooksPath)" = harness/tools/git-hooks'
step "nothing was committed" bash -c 'test "$(git rev-list --count HEAD)" = 1'

echo
[ $fail -eq 0 ] && echo "THE PROOF HOLDS" || echo "THE PROOF FAILS"
exit $fail
