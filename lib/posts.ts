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
}

export interface PostPreview {
  id: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  tags: string[];
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

  // Ensure tags exist and are in array format
  const tags = matterResult.data.tags 
    ? Array.isArray(matterResult.data.tags) 
      ? matterResult.data.tags 
      : [matterResult.data.tags]
    : []

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    title: matterResult.data.title as string,
    date: matterResult.data.date as string,
    readTime: matterResult.data.readTime as string,
    excerpt: matterResult.data.excerpt as string,
    tags,
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