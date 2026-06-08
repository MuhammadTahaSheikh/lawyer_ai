#!/usr/bin/env bash
# Smoke-test key API routes (VPS direct + Vercel proxy shape)
set -euo pipefail

KEY="${API_KEY:-LSzuRrbln9oyKUz05E9bgQe1tBNtZLft}"
VPS="http://187.124.52.234"
VERCEL="https://lawyer-ai-eight.vercel.app/api"

pass=0
fail=0

check() {
  local name="$1" url="$2" expect="$3"
  local code body
  body=$(curl -s -w "\n%{http_code}" --max-time 15 -H "x-api-key: $KEY" "$url" | tail -1)
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -H "x-api-key: $KEY" "$url")
  if [[ "$code" == "$expect" ]] || [[ "$expect" == "2xx" && "$code" =~ ^2 ]]; then
    echo "OK   $name ($code)"
    pass=$((pass+1))
  else
    echo "FAIL $name ($code, expected $expect) $url"
    fail=$((fail+1))
  fi
}

echo "=== VPS direct (port 80) ==="
check "cases"           "$VPS/cases?page=1&limit=1" "2xx"
check "clients"         "$VPS/clients?page=1" "2xx"
check "events"          "$VPS/events?start=2026-01-01&end=2026-12-31" "2xx"
check "case_stages"     "$VPS/case_stages" "2xx"
check "practice_areas"  "$VPS/practice_areas" "2xx"
check "columns"         "$VPS/columns?parent_type=case" "2xx"
check "active-users"    "$VPS/active-users" "2xx"
check "tasks"           "$VPS/tasks" "2xx"
check "tickets/templates" "$VPS/tickets/templates" "2xx"

echo ""
echo "=== VPS must NOT have /api prefix on standard routes ==="
code=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $KEY" "$VPS/api/cases?page=1")
if [[ "$code" == "404" ]]; then echo "OK   /api/cases returns 404 on VPS (correct)"; pass=$((pass+1)); else echo "FAIL /api/cases should 404, got $code"; fail=$((fail+1)); fi

echo ""
echo "=== Vercel proxy (/api -> VPS) ==="
check "vercel cases"        "$VERCEL/cases?page=1&limit=1" "2xx"
check "vercel clients"      "$VERCEL/clients?page=1" "2xx"
check "vercel events"       "$VERCEL/events?start=2026-01-01&end=2026-12-31" "2xx"
check "vercel case_stages"  "$VERCEL/case_stages" "2xx"
check "vercel practice_areas" "$VERCEL/practice_areas" "2xx"

code=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $KEY" "$VERCEL/api/cases?page=1")
if [[ "$code" == "404" ]]; then echo "OK   vercel /api/api/cases returns 404 (no double prefix)"; pass=$((pass+1)); else echo "FAIL vercel double /api should 404, got $code"; fail=$((fail+1)); fi

echo ""
echo "=== Results: $pass passed, $fail failed ==="
[[ "$fail" -eq 0 ]]
