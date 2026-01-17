#!/usr/bin/env bash
set -euo pipefail

trap 'kill 0' EXIT

npm --prefix back run start:dev &
NEXT_DISABLE_SWC_NATIVE=1 npm --prefix front run dev
