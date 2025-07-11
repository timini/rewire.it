import { getSortedPostsData, getAllTags } from '@/lib/posts'
import { MetadataRoute } from 'next'

const bucketName = process.env.GCP_BUCKET_NAME || 'rewire-it';
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? `/${bucketName}` : '';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://rewire.it";
  const posts = getSortedPostsData();
  const tags = getAllTags();
  
  // Generate entries for blog posts
  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}${basePath}/blog/${post.id}`,
    lastModified: post.date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  
  // Generate entries for tag pages
  const tagEntries = tags.map((tag) => ({
    url: `${baseUrl}${basePath}/tags/${tag.toLowerCase().replace(/\s+/g, '-')}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));
  
  // Static routes
  const routes = [
    {
      url: `${baseUrl}${basePath}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}${basePath}/tags`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    // Add more static routes as needed
  ];
  
  return [...routes, ...blogEntries, ...tagEntries];
} 