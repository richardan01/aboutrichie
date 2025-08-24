export function Meta({
  titleSuffix,
  description,
}: {
  titleSuffix: string;
  description: string;
}) {
  return (
    <>
      <title>Richard Ng's personal website | {titleSuffix}</title>
      <meta name="description" content={description} />
      {/* Open Graph meta tags */}
      <meta
        property="og:title"
        content={`Richard Ng's personal website | ${titleSuffix}`}
      />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="/og-image.png" />
      <meta
        property="og:image:alt"
        content="Richard Ng's personal website preview"
      />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Richard Ng's personal website" />
      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta
        name="twitter:title"
        content={`Richard Ng's personal website | ${titleSuffix}`}
      />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/og-image.png" />
      <meta
        name="twitter:image:alt"
        content="Richard Ng's personal website preview"
      />
    </>
  );
}
