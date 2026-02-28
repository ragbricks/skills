#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <target-project-root>"
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
template_dir="${script_dir}/../assets/templates"
target_root="$1"

mkdir -p "${target_root}"
cp -R "${template_dir}/." "${target_root}"

echo "Copied DDD + LangChain/LangGraph templates to ${target_root}"
