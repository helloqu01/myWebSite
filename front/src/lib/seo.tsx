import React from "react";

type SeoParams = {
  title: string;
  description: string;
  path: string;
};

const BASE_URL = "https://codingbyohj.com";
const DEFAULT_IMAGE = "https://codingbyohj.com/images/businesscard.png";

export function SeoHead({ title, description, path }: SeoParams) {
  const url = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Oh Hyunji`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ko_KR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />
    </>
  );
}
