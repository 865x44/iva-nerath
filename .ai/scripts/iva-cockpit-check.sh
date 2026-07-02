#!/usr/bin/env bash
# Read-only safety-state check for the Iva Cockpit. Prints, never mutates.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

branch="$(git branch --show-current 2>/dev/null || echo "unknown")"
dirty_count="$(git status --short 2>/dev/null | wc -l | tr -d ' ')"

cockpit_present="absent"
[ -f ".ai/IVA_COCKPIT.md" ] && cockpit_present="present"

state_present="absent"
[ -f ".ai/STATE.md" ] && state_present="present"

mode="unknown"
write_permission="unknown"
if [ -f ".ai/IVA_COCKPIT.md" ]; then
  mode="$(grep -m1 '^MODE:' .ai/IVA_COCKPIT.md | sed 's/^MODE:[[:space:]]*//' || echo unknown)"
  write_permission="$(grep -m1 '^WRITE_PERMISSION:' .ai/IVA_COCKPIT.md | sed 's/^WRITE_PERMISSION:[[:space:]]*//' || echo unknown)"
  [ -z "$mode" ] && mode="unknown"
  [ -z "$write_permission" ] && write_permission="unknown"
fi

echo "Iva Cockpit Check"
echo "branch: ${branch}"
echo "dirty files: ${dirty_count}"
echo "cockpit: ${cockpit_present}"
echo "state: ${state_present}"
echo "mode: ${mode}"
echo "write permission: ${write_permission}"
