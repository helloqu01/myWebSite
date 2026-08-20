#!/usr/bin/env bash
set -euo pipefail

distribution_id="${1:-}"
bucket_name="${2:-}"
api_origin_domain="${3:-}"
function_name="codingbyohj-static-route-rewrite"
oac_name="codingbyohj-${bucket_name}-oac"
headers_policy_name="codingbyohj-security-headers"

if [[ -z "$distribution_id" || -z "$bucket_name" ]]; then
  echo "Usage: $0 <distribution-id> <bucket-name> [api-origin-domain]" >&2
  exit 1
fi

if [[ -n "$api_origin_domain" && ( "$api_origin_domain" == *"://"* || "$api_origin_domain" == */* ) ]]; then
  echo "API origin must be a domain without protocol or path: $api_origin_domain" >&2
  exit 1
fi

task_tmp_dir="$(mktemp -d)"
trap 'rm -rf "$task_tmp_dir"' EXIT

if aws cloudfront describe-function --name "$function_name" >"$task_tmp_dir/function.json" 2>/dev/null; then
  function_etag="$(jq -r '.ETag' "$task_tmp_dir/function.json")"
  aws cloudfront update-function \
    --name "$function_name" \
    --if-match "$function_etag" \
    --function-config 'Comment=Rewrite static routes to index.html,Runtime=cloudfront-js-2.0' \
    --function-code fileb://infra/cloudfront-viewer-request.js >/dev/null
else
  aws cloudfront create-function \
    --name "$function_name" \
    --function-config 'Comment=Rewrite static routes to index.html,Runtime=cloudfront-js-2.0' \
    --function-code fileb://infra/cloudfront-viewer-request.js >/dev/null
fi

aws cloudfront describe-function --name "$function_name" >"$task_tmp_dir/function.json"
function_etag="$(jq -r '.ETag' "$task_tmp_dir/function.json")"
aws cloudfront publish-function --name "$function_name" --if-match "$function_etag" >/dev/null
function_arn="$(aws cloudfront describe-function --name "$function_name" --stage LIVE --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)"

oac_id="$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='${oac_name}'].Id | [0]" --output text)"
if [[ -z "$oac_id" || "$oac_id" == "None" ]]; then
  jq -n --arg name "$oac_name" '{Name:$name,Description:"Private S3 access for codingbyohj.com",SigningProtocol:"sigv4",SigningBehavior:"always",OriginAccessControlOriginType:"s3"}' >"$task_tmp_dir/oac.json"
  oac_id="$(aws cloudfront create-origin-access-control --origin-access-control-config file://"$task_tmp_dir/oac.json" --query 'OriginAccessControl.Id' --output text)"
fi

content_security_policy="default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss: blob:; worker-src 'self' blob:; media-src 'self' blob: https://*.supabase.co; frame-src https://*.google.com https://*.doubleclick.net https://*.googlesyndication.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
jq -n \
  --arg name "$headers_policy_name" \
  --arg csp "$content_security_policy" \
  '{Name:$name,Comment:"Security and privacy headers for codingbyohj.com",SecurityHeadersConfig:{XSSProtection:{Override:true,Protection:true,ModeBlock:true},FrameOptions:{Override:true,FrameOption:"DENY"},ReferrerPolicy:{Override:true,ReferrerPolicy:"strict-origin-when-cross-origin"},ContentTypeOptions:{Override:true},StrictTransportSecurity:{Override:true,AccessControlMaxAgeSec:63072000,IncludeSubdomains:true,Preload:true},ContentSecurityPolicy:{Override:true,ContentSecurityPolicy:$csp}},CustomHeadersConfig:{Quantity:2,Items:[{Header:"Permissions-Policy",Value:"camera=(self), microphone=(), geolocation=()",Override:true},{Header:"Cross-Origin-Opener-Policy",Value:"same-origin-allow-popups",Override:true}]}}' \
  >"$task_tmp_dir/headers-policy.json"

headers_policy_id="$(aws cloudfront list-response-headers-policies --type custom --query "ResponseHeadersPolicyList.Items[?ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name=='${headers_policy_name}'].ResponseHeadersPolicy.Id | [0]" --output text)"
if [[ -z "$headers_policy_id" || "$headers_policy_id" == "None" ]]; then
  headers_policy_id="$(aws cloudfront create-response-headers-policy --response-headers-policy-config file://"$task_tmp_dir/headers-policy.json" --query 'ResponseHeadersPolicy.Id' --output text)"
else
  aws cloudfront get-response-headers-policy-config --id "$headers_policy_id" >"$task_tmp_dir/current-headers-policy.json"
  headers_policy_etag="$(jq -r '.ETag' "$task_tmp_dir/current-headers-policy.json")"
  aws cloudfront update-response-headers-policy --id "$headers_policy_id" --if-match "$headers_policy_etag" --response-headers-policy-config file://"$task_tmp_dir/headers-policy.json" >/dev/null
fi

aws cloudfront get-distribution-config --id "$distribution_id" >"$task_tmp_dir/distribution.json"
distribution_etag="$(jq -r '.ETag' "$task_tmp_dir/distribution.json")"
jq '.DistributionConfig' "$task_tmp_dir/distribution.json" >"$task_tmp_dir/config.json"

jq \
  --arg function_arn "$function_arn" \
  --arg oac_id "$oac_id" \
  --arg bucket "$bucket_name" \
  --arg bucket_domain "${bucket_name}.s3.amazonaws.com" \
  --arg security_headers_policy "$headers_policy_id" \
  '
    .Origins.Items |= map(
      if (.DomainName == $bucket_domain or (.DomainName | startswith($bucket + ".s3"))) then
        .OriginAccessControlId = $oac_id
        | .S3OriginConfig = {OriginAccessIdentity:""}
      else . end
    )
    | .DefaultCacheBehavior.FunctionAssociations.Items = (
        ((.DefaultCacheBehavior.FunctionAssociations.Items // []) | map(select(.EventType != "viewer-request")))
        + [{EventType:"viewer-request",FunctionARN:$function_arn}]
      )
    | .DefaultCacheBehavior.FunctionAssociations.Quantity = (.DefaultCacheBehavior.FunctionAssociations.Items | length)
    | .DefaultCacheBehavior.ResponseHeadersPolicyId = $security_headers_policy
  ' "$task_tmp_dir/config.json" >"$task_tmp_dir/config-with-static.json"

if [[ -n "$api_origin_domain" ]]; then
  jq \
    --arg api_domain "$api_origin_domain" \
    '
      .Origins.Items = (
        ((.Origins.Items // []) | map(select(.Id != "ContactApi")))
        + [{Id:"ContactApi",DomainName:$api_domain,OriginPath:"/prod",CustomHeaders:{Quantity:0},CustomOriginConfig:{HTTPPort:80,HTTPSPort:443,OriginProtocolPolicy:"https-only",OriginSslProtocols:{Quantity:1,Items:["TLSv1.2"]},OriginReadTimeout:30,OriginKeepaliveTimeout:5},ConnectionAttempts:3,ConnectionTimeout:10,OriginShield:{Enabled:false}}]
      )
      | .Origins.Quantity = (.Origins.Items | length)
      | .CacheBehaviors.Items = (
        ((.CacheBehaviors.Items // []) | map(select(.PathPattern != "/api/*")))
        + [{PathPattern:"/api/*",TargetOriginId:"ContactApi",TrustedSigners:{Enabled:false,Quantity:0},TrustedKeyGroups:{Enabled:false,Quantity:0},ViewerProtocolPolicy:"https-only",AllowedMethods:{Quantity:7,Items:["HEAD","DELETE","POST","GET","OPTIONS","PUT","PATCH"],CachedMethods:{Quantity:2,Items:["HEAD","GET"]}},SmoothStreaming:false,Compress:true,LambdaFunctionAssociations:{Quantity:0},FunctionAssociations:{Quantity:0},FieldLevelEncryptionId:"",CachePolicyId:"413f1600-52d8-4f08-9b69-8cc683b3417e",OriginRequestPolicyId:"b689b0a8-53d0-40ab-baf2-68738e2966ac"}]
      )
      | .CacheBehaviors.Quantity = (.CacheBehaviors.Items | length)
    ' "$task_tmp_dir/config-with-static.json" >"$task_tmp_dir/config-final.json"
else
  cp "$task_tmp_dir/config-with-static.json" "$task_tmp_dir/config-final.json"
  echo "API_ORIGIN_DOMAIN is empty; /api/* origin configuration was skipped." >&2
fi

aws cloudfront update-distribution \
  --id "$distribution_id" \
  --if-match "$distribution_etag" \
  --distribution-config file://"$task_tmp_dir/config-final.json" >/dev/null

aws cloudfront wait distribution-deployed --id "$distribution_id"

aws_account_id="$(aws sts get-caller-identity --query Account --output text)"
jq -n \
  --arg bucket "$bucket_name" \
  --arg source "arn:aws:cloudfront::${aws_account_id}:distribution/${distribution_id}" \
  '{Version:"2012-10-17",Statement:[{Sid:"DenyInsecureTransport",Effect:"Deny",Principal:"*",Action:"s3:*",Resource:[("arn:aws:s3:::"+$bucket),("arn:aws:s3:::"+$bucket+"/*")],Condition:{Bool:{"aws:SecureTransport":"false"}}},{Sid:"AllowCloudFrontOAC",Effect:"Allow",Principal:{Service:"cloudfront.amazonaws.com"},Action:"s3:GetObject",Resource:("arn:aws:s3:::"+$bucket+"/*"),Condition:{StringEquals:{"AWS:SourceArn":$source}}}]}' \
  >"$task_tmp_dir/bucket-policy.json"

aws s3api put-public-access-block \
  --bucket "$bucket_name" \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-policy --bucket "$bucket_name" --policy file://"$task_tmp_dir/bucket-policy.json"
