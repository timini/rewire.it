import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { getSortedPostsData, PostPreview, getAllTags } from '@/lib/posts'
import type { Metadata } from 'next'
import JSONLD from '@/components/jsonld'
import Tag from '@/components/tag'

export const metadata: Metadata = {
  title: "rewire.it Blog - Technology, AI, and Software Development",
  description: "Exploring the fascinating connections between technology, AI, and other fields. Join me as I explore the world of development and share what I discover.",
  keywords: ["blog", "technology", "AI", "software development", "cognitive science", "programming"],
  openGraph: {
    title: "rewire.it Blog - Technology, AI, and Software Development",
    description: "Exploring the fascinating connections between technology, AI, and other fields.",
    url: "https://rewire.it",
    siteName: "rewire.it Blog",
    images: [
      {
        url: "https://rewire.it/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "rewire.it Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "rewire.it Blog",
    description: "Technology, AI, and Software Development insights",
    creator: "@timrichardson",
    images: ["https://rewire.it/og-image.jpg"], // Replace with your actual Twitter card image
  },
  alternates: {
    canonical: "https://rewire.it",
  },
}

export default function HomePage() {
  const blogPosts: PostPreview[] = getSortedPostsData();
  const popularTags = getAllTags().slice(0, 8);
  
  // Website schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "rewire.it Blog",
    "url": "https://rewire.it",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rewire.it/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <JSONLD data={websiteSchema} />
      
      {/* Hero section with improved design */}
      <section className="relative mb-20 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-400 rounded-full filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-400 rounded-full filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-white">
          <h1 className="font-montserrat text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-3xl">
            Exploring the connections between technology, cognition, and meaning
          </h1>
          <p className="text-xl mb-8 max-w-2xl opacity-90">
            Software, learning, and the fascinating connections between technology and other fields. Join me as I explore
            the world of development and share what I discover.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="#latest-posts"
              className="inline-flex items-center px-6 py-3 bg-white text-purple-700 rounded-full hover:bg-purple-50 transition-colors font-medium"
            >
              Explore Latest Posts
              <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/tags"
              className="inline-flex items-center px-6 py-3 bg-purple-700/30 backdrop-blur-sm text-white rounded-full hover:bg-purple-700/40 transition-colors font-medium"
            >
              Browse Topics
            </Link>
          </div>
        </div>
      </section>
      
      {/* Popular topics section */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-montserrat">
            Popular Topics
          </h2>
          <Link href="/tags" className="text-purple-600 hover:text-purple-700 flex items-center text-sm font-medium">
            View all topics
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {popularTags.map(tag => (
            <Tag key={tag} name={tag} className="text-base px-4 py-2" />
          ))}
        </div>
      </section>

      {/* Latest posts section with improved card design */}
      <section id="latest-posts" className="scroll-mt-20">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 font-montserrat">
          Latest Posts
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article 
              key={post.id} 
              className="group relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl border border-gray-100" 
              itemScope 
              itemType="https://schema.org/BlogPosting"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-6 h-full flex flex-col relative">
                <Link href={`/blog/${post.id}`} className="block mb-3">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-purple-600 transition-colors font-montserrat" itemProp="headline">
                    {post.title}
                  </h3>
                </Link>
                
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <Tag key={tag} name={tag} />
                    ))}
                  </div>
                )}
                
                <Link href={`/blog/${post.id}`} className="block flex-grow">
                  <p className="text-gray-600 mb-4" itemProp="description">{post.excerpt}</p>
                </Link>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                  <time itemProp="datePublished" dateTime={post.date}>{post.date}</time>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    {post.readTime}
                  </span>
                </div>
                
                <meta itemProp="author" content="Tim Richardson" />
                <meta itemProp="keywords" content={post.tags.join(',')} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

