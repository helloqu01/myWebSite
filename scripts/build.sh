#!/usr/bin/env bash
set -euo pipefail

npm --prefix back run build
NEXT_DISABLE_SWC_NATIVE=1 NEXT_DISABLE_SWC_DOWNLOAD=1 NEXT_FORCE_SWC_WASM=1 npm --prefix front run build
