import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAllTags, getPostsByTag } from '@/lib/posts'
import type { Metadata } from 'next'
import JSONLD from '@/components/jsonld'
import Tag from '@/components/tag'

export const metadata: Metadata = {
  title: "All Tags - rewire.it Blog",
  description: "Browse all topics covered in the rewire.it blog. Find articles by tags and categories.",
  keywords: ["blog", "tags", "topics", "categories", "technology", "AI", "software development"],
  openGraph: {
    title: "All Tags - rewire.it Blog",
    description: "Browse all topics covered in the rewire.it blog",
    url: "https://rewire.it/tags",
    images: [
      {
        url: 'https://rewire.it/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "All tags on rewire.it Blog",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "All Tags - rewire.it Blog",
    description: "Browse all topics covered in the rewire.it blog",
    creator: '@timrichardson',
    images: ['https://rewire.it/og-image.jpg'],
  },
  alternates: {
    canonical: "https://rewire.it/tags",
  }
}

export default function TagsIndexPage() {
  const tags = getAllTags()
  
  // Count posts for each tag
  const tagCounts = tags.map(tag => ({
    name: tag,
    count: getPostsByTag(tag).length
  })).sort((a, b) => b.count - a.count) // Sort by post count (most popular first)
  
  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "headline": "All Tags",
    "description": "Browse all topics covered in the rewire.it blog",
    "url": "https://rewire.it/tags",
  }
  
  return (
    <>
      <JSONLD data={jsonLd} />
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 sm:p-8 mb-8">
          <Link href=".." className="text-blue-600 hover:text-blue-800 inline-flex items-center mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            All Tags
          </h1>
          
          <div className="flex flex-wrap gap-3">
            {tagCounts.map(tag => (
              <Tag 
                key={tag.name} 
                name={tag.name} 
                count={tag.count} 
                className="text-base px-4 py-2 mb-2"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
} 