import { getSortedPostsData, PostPreview } from '@/lib/posts';
import Link from 'next/link';

export default function Blog() {
  const posts = getSortedPostsData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Blog</h1>
      <div className="space-y-8">
        {posts.map(({ id, title, date, excerpt, readTime }: PostPreview) => (
          <article key={id} className="border-b pb-4">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${id}`} className="text-gray-900 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300">
                {title}
              </Link>
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="mx-2">•</span>
              <span>{readTime}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {excerpt}
            </p>
            <Link href={`/blog/${id}`} className="text-blue-600 hover:underline dark:text-blue-400 mt-2 inline-block">
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
} 