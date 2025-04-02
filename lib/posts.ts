import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostData {
  id: string;
  contentHtml: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  references?: Record<string, string>;
}

export interface PostPreview {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
  hasCitations: boolean;
}

export function getSortedPostsData(): PostPreview[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)
    
    // Check if the post has references
    const hasCitations = !!matterResult.data.references && 
      Object.keys(matterResult.data.references).length > 0;

    // Ensure tags exist and are in array format
    const tags = matterResult.data.tags 
      ? Array.isArray(matterResult.data.tags) 
        ? matterResult.data.tags 
        : [matterResult.data.tags]
      : []

    // Combine the data with the id
    return {
      id,
      title: matterResult.data.title as string,
      date: matterResult.data.date as string,
      readTime: matterResult.data.readTime as string,
      excerpt: matterResult.data.excerpt as string,
      tags,
      hasCitations
    }
  })
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map((fileName) => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, ''),
      },
    }
  })
}

export async function getPostData(id: string): Promise<PostData> {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Get references from frontmatter if they exist
  const references = matterResult.data.references || {}

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    references,
    title: matterResult.data.title as string,
    date: matterResult.data.date as string,
    readTime: matterResult.data.readTime as string,
    excerpt: matterResult.data.excerpt as string,
    tags: matterResult.data.tags || [],
  }
}

// New function to get all unique tags across all posts
export function getAllTags(): string[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allTags = new Set<string>();
  
  fileNames.forEach(fileName => {
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    
    const tags = matterResult.data.tags 
      ? Array.isArray(matterResult.data.tags) 
        ? matterResult.data.tags 
        : [matterResult.data.tags]
      : [];
      
    tags.forEach(tag => allTags.add(tag));
  });
  
  return Array.from(allTags).sort();
}

// New function to get all posts with a specific tag
export function getPostsByTag(tag: string): PostPreview[] {
  const allPosts = getSortedPostsData();
  // Use case-insensitive matching for tags
  return allPosts.filter(post => 
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  );
}

// Add this function to get all references for a post
export async function getPostReferences(id: string): Promise<Record<string, string>> {
  const fullPath = path.join(postsDirectory, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);
  
  // Return references from frontmatter if they exist
  return matterResult.data.references || {};
} 