import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getAllPostIds, getPostData } from '@/lib/posts'
import type { Metadata } from 'next'
import JSONLD from '@/components/jsonld'
import Tag from '@/components/tag'

// Define generateMetadata function with enhanced SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getPostData(params.slug)
    const title = `${post.title} - rewire.it Blog`
    const description = post.excerpt

    return {
      title,
      description,
      authors: [{ name: "Tim Richardson" }],
      keywords: ["blog", "technology", "AI", "software development", params.slug.replace(/-/g, ', ')],
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: post.date,
        authors: ['Tim Richardson'],
        url: `https://rewire.it/blog/${params.slug}`,
        images: [
          {
            url: 'https://rewire.it/og-image.jpg', // Replace with your actual OG image
            width: 1200,
            height: 630,
            alt: post.title,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        creator: '@timrichardson',
        images: ['https://rewire.it/og-image.jpg'], // Replace with your actual Twitter card image
      },
      alternates: {
        canonical: `https://rewire.it/blog/${params.slug}`,
      }
    }
  } catch {
    // Handle case where post is not found during metadata generation
    return {
      title: "Post Not Found - rewire.it Blog",
      description: "The requested blog post could not be found.",
    }
  }
}

// Allow Next.js to dynamically render pages for slugs not generated at build time.
// This is useful for previewing new posts in development.
export const dynamicParams = true;

// Define generateStaticParams function
export async function generateStaticParams() {
  const paths = getAllPostIds()
  // The paths returned by getAllPostIds are already in the correct format
  // { params: { slug: '...' } }
  return paths
}

// Function to process citation references in the content
function processCitations(content: string, references: Record<string, string>) {
  // Pattern to match citation references like [1], [13], etc.
  const citationPattern = /\[(\d+)\]/g;
  
  // Replace each citation with a proper link
  return content.replace(citationPattern, (match, referenceNumber) => {
    const externalUrl = references[referenceNumber];
    if (externalUrl) {
      return `<a href="${externalUrl}" target="_blank" rel="noopener noreferrer" class="citation-link">${match}</a>`;
    }
    // If no URL is found for this reference, keep it as is
    return match;
  });
}

// Define the page component with improved semantic HTML and structured data
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post;
  try {
    post = await getPostData(params.slug)
    
    // Process citations if post has references
    if (post.references) {
      post.contentHtml = processCitations(post.contentHtml, post.references);
    }
  } catch {
    // If getPostData throws (e.g., file not found), trigger a 404
    notFound()
  }

  // Define JSON-LD structured data for the blog post
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": "Tim Richardson"
    },
    "datePublished": post.date,
    "image": "https://rewire.it/og-image.jpg", // Replace with actual post image
    "publisher": {
      "@type": "Organization",
      "name": "rewire.it",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rewire.it/logo.png" // Replace with your logo URL
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://rewire.it/blog/${params.slug}`
    },
    "keywords": post.tags.join(',')
  };

  return (
    <>
      <JSONLD data={jsonLd} />
      <div className="max-w-4xl mx-auto py-8">
        <article 
          className="bg-white rounded-xl shadow-md overflow-hidden relative"
          itemScope 
          itemType="https://schema.org/BlogPosting"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          
          <div className="p-8">
            <nav aria-label="Breadcrumb" className="mb-8">
              <Link href="/" className="text-purple-600 hover:text-purple-800 inline-flex items-center text-sm font-medium">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </nav>
            
            <header className="mb-8">
              <h1 
                className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 font-montserrat" 
                itemProp="headline"
              >
                {post.title}
              </h1>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <time itemProp="datePublished" dateTime={post.date}>{post.date}</time>
                <span className="mx-2">•</span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  {post.readTime}
                </span>
              </div>
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-gray-100">
                  {post.tags.map(tag => (
                    <Tag key={tag} name={tag} />
                  ))}
                </div>
              )}
            </header>
            
            <div 
              className="prose prose-lg max-w-none text-gray-700 prose-headings:font-montserrat prose-headings:font-bold prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
              itemProp="articleBody"
            />
            
            {/* References section */}
            {post.references && Object.keys(post.references).length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <h2 className="text-2xl font-bold mb-4 font-montserrat">References</h2>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  {Object.entries(post.references).map(([number, url]) => (
                    <li key={number} id={`ref-${number}`} className="text-gray-700">
                      <span className="font-medium">[{number}]</span>{' '}
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            <footer className="mt-10 pt-6 border-t border-gray-100">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Tag key={tag} name={tag} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Published on <time itemProp="datePublished" dateTime={post.date}>{post.date}</time> by 
                <span itemProp="author" itemScope itemType="https://schema.org/Person">
                  <span itemProp="name" className="font-medium text-gray-700"> Tim Richardson</span>
                </span>
              </p>
            </footer>
          </div>
        </article>
      </div>
    </>
  )
} 