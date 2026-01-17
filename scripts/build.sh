#!/usr/bin/env bash
set -euo pipefail

npm --prefix back run build
NEXT_DISABLE_SWC_NATIVE=1 npm --prefix front run build
