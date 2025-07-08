import Script from "next/script"

export default function JSONLD({ data }: { data: Record<string, unknown> }) {
  return (
    <Script 
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
} 