#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${1:-https://codingbyohj.com}"
EXPECTED_ADS_TXT="google.com, pub-1115617071874827, DIRECT, f08c47fec0942fa0"
ADS_TXT_URL="${SITE_URL%/}/ads.txt"

echo "Checking AdSense assets for: ${SITE_URL}"
echo

tmp_headers="$(mktemp)"
tmp_body="$(mktemp)"
trap 'rm -f "$tmp_headers" "$tmp_body"' EXIT

curl -sS -D "$tmp_headers" -o "$tmp_body" "$ADS_TXT_URL"

status_line="$(head -n 1 "$tmp_headers" | tr -d '\r')"
content_type="$(awk 'BEGIN{IGNORECASE=1} /^content-type:/ {print $2}' "$tmp_headers" | tr -d '\r')"
body="$(tr -d '\r' < "$tmp_body")"

echo "ads.txt status : ${status_line}"
echo "content-type   : ${content_type:-unknown}"
echo "body           : ${body}"
echo

if ! grep -q " 200 " <<<"$status_line"; then
  echo "FAIL: ads.txt is not returning HTTP 200."
  exit 1
fi

if [[ "${content_type:-}" != text/plain* ]]; then
  echo "FAIL: ads.txt content-type should start with text/plain."
  exit 1
fi

if [[ "$body" != "$EXPECTED_ADS_TXT" ]]; then
  echo "FAIL: ads.txt content does not match the expected publisher line."
  exit 1
fi

home_html="$(curl -sS "${SITE_URL%/}/")"
if grep -q 'name="google-adsense-account"' <<<"$home_html"; then
  echo "homepage meta  : google-adsense-account present"
else
  echo "homepage meta  : google-adsense-account missing"
fi

echo
echo "OK: ads.txt is reachable and matches the expected AdSense publisher record."
