#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-front/out}"
bucket_name="${2:-}"

if [[ -z "$bucket_name" ]]; then
  echo "S3 bucket name is required." >&2
  exit 1
fi

if [[ ! -d "$output_dir" ]]; then
  echo "Static export directory does not exist: $output_dir" >&2
  exit 1
fi

# CloudFront uses the private S3 REST origin, which does not resolve
# /about/ to /about/index.html. Upload the same HTML under both route keys so
# direct navigation and browser refresh work without making the bucket public.
while IFS= read -r -d '' index_file; do
  relative_path="${index_file#"$output_dir"/}"
  route_key="${relative_path%index.html}"
  [[ -z "$route_key" ]] && continue

  aws s3api put-object \
    --bucket "$bucket_name" \
    --key "$route_key" \
    --body "$index_file" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=0, must-revalidate" \
    </dev/null \
    >/dev/null

  aws s3api put-object \
    --bucket "$bucket_name" \
    --key "${route_key%/}" \
    --body "$index_file" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=0, must-revalidate" \
    </dev/null \
    >/dev/null
done < <(find "$output_dir" -type f -name index.html -print0)
