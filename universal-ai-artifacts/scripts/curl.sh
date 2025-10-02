#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://your-domain.com}"
TOKEN="${TOKEN:-YOUR_TOKEN}"

_auth_header() {
  echo "Authorization: Bearer ${TOKEN}"
}

usage() {
  cat <<EOF
Usage: BASE_URL=... TOKEN=... $0 <command>
Commands:
  health
  chat <message>
  rag_search <query>
  plugin_execute <plugin> <action> <json_parameters>
  analytics_dashboard
EOF
}

health() {
  curl -sS "${BASE_URL}/health" | jq .
}

chat() {
  local msg="${1:-Hello}"
  curl -sS -X POST "${BASE_URL}/chat" \
    -H "$(_auth_header)" -H 'Content-Type: application/json' \
    -d "{\"message\": \"${msg}\"}" | jq .
}

rag_search() {
  local q="${1:-machine learning}"
  curl -sS -X POST "${BASE_URL}/rag/search" \
    -H "$(_auth_header)" -H 'Content-Type: application/json' \
    -d "{\"query\": \"${q}\", \"collection\": \"knowledge_base\", \"limit\": 5}" | jq .
}

plugin_execute() {
  local plugin="${1:?pluginName}"
  local action="${2:?action}"
  local params="${3:-{}}"
  curl -sS -X POST "${BASE_URL}/plugins/${plugin}/execute" \
    -H "$(_auth_header)" -H 'Content-Type: application/json' \
    -d "{\"action\": \"${action}\", \"parameters\": ${params}}" | jq .
}

analytics_dashboard() {
  curl -sS "${BASE_URL}/analytics/dashboard" -H "$(_auth_header)" | jq .
}

cmd="${1:-}"
case "$cmd" in
  health) shift; health "$@" ;;
  chat) shift; chat "$@" ;;
  rag_search) shift; rag_search "$@" ;;
  plugin_execute) shift; plugin_execute "$@" ;;
  analytics_dashboard) shift; analytics_dashboard "$@" ;;
  *) usage; exit 1 ;;
 esac