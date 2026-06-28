/**
 * Renders a JSON-LD <script> for structured data (SEO). Server component —
 * safe to drop into any page. Pass a single schema object or an array.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
