#!/usr/bin/env bash
set -euo pipefail

trap 'kill 0' EXIT

npm --prefix back run start:dev &
NEXT_DISABLE_SWC_NATIVE=1 NEXT_DISABLE_SWC_DOWNLOAD=1 NEXT_FORCE_SWC_WASM=1 npm --prefix front run dev
