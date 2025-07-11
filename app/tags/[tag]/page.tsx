import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAllTags, getPostsByTag } from '@/lib/posts'
import type { Metadata } from 'next'
import JSONLD from '@/components/jsonld'
import Tag from '@/components/tag'

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag).replace(/-/g, ' ')
  const capitalizedTag = tag.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return {
    title: `${capitalizedTag} - Posts tagged with ${capitalizedTag} - rewire.it Blog`,
    description: `Articles about ${tag} on rewire.it blog. Explore posts related to ${tag}.`,
    keywords: ["blog", tag, "technology", "AI", "software development"],
    openGraph: {
      title: `${capitalizedTag} - rewire.it Blog`,
      description: `Articles about ${tag} on rewire.it blog`,
      url: `https://rewire.it/tags/${params.tag}`,
      images: [
        {
          url: 'https://rewire.it/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Posts tagged with ${tag}`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${capitalizedTag} - rewire.it Blog`,
      description: `Articles about ${tag} on rewire.it blog`,
      creator: '@timrichardson',
      images: ['https://rewire.it/og-image.jpg'],
    },
    alternates: {
      canonical: `https://rewire.it/tags/${params.tag}`,
    }
  }
}

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map(tag => ({
    tag: tag.toLowerCase().replace(/\s+/g, '-')
  }))
}

export default function TagPage({ params }: { params: { tag: string } }) {
  // Make sure to normalize the tag by decoding URL params and replacing hyphens with spaces
  const decodedTag = decodeURIComponent(params.tag).replace(/-/g, ' ')
  
  // Get all available tags for case-insensitive matching
  const allTags = getAllTags()
  
  // Find the actual tag with correct case from our list of tags
  // This makes tag lookup case-insensitive
  const matchedTag = allTags.find(tag => tag.toLowerCase() === decodedTag.toLowerCase())
  
  if (!matchedTag) {
    notFound()
  }
  
  // Use the correctly cased tag to get posts
  const posts = getPostsByTag(matchedTag)
  
  if (posts.length === 0) {
    notFound()
  }
  
  // Capitalize tag for display
  const displayTag = matchedTag
  
  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "headline": `Posts tagged with ${displayTag}`,
    "description": `Articles about ${decodedTag} on rewire.it blog`,
    "url": `https://rewire.it/tags/${params.tag}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://rewire.it/blog/${post.id}`,
        "name": post.title
      }))
    }
  }
  
  return (
    <>
      <JSONLD data={jsonLd} />
      <div className="max-w-4xl mx-auto py-8">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 mb-12">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light"></div>
          <div className="relative p-8 text-white">
            <nav aria-label="Breadcrumb" className="mb-6">
              <Link href="../.." className="text-white/80 hover:text-white inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white font-montserrat">
              #{displayTag}
            </h1>
            <p className="text-white/80 mb-2">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} tagged with &quot;{displayTag}&quot;
            </p>
          </div>
        </div>
          
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map(post => (
            <article 
              key={post.id}
              className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl border border-gray-100" 
              itemScope 
              itemType="https://schema.org/BlogPosting"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 h-full flex flex-col relative">
                <Link href={`../../blog/${post.id}`} className="block mb-3">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors font-montserrat" itemProp="headline">
                    {post.title}
                  </h2>
                </Link>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <time itemProp="datePublished" dateTime={post.date}>{post.date}</time>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    {post.readTime}
                  </span>
                </div>
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <Tag key={tag} name={tag} />
                    ))}
                  </div>
                )}
                
                <Link href={`../../blog/${post.id}`} className="block flex-grow">
                  <p className="text-gray-600 mb-4" itemProp="description">{post.excerpt}</p>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
} 