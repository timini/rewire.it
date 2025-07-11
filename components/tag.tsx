"use client";

import Link from 'next/link'
import { FC, MouseEvent } from 'react'

interface TagProps {
  name: string
  count?: number
  className?: string
}

const Tag: FC<TagProps> = ({ name, count, className = '' }) => {
  // Handle click event to prevent it from bubbling up to parent elements
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  // Ensure consistent URL format for tags
  const tagUrl = `tags/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`;
  
  return (
    <Link 
      href={tagUrl}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 hover:shadow-sm transition-all cursor-pointer ${className}`}
      onClick={handleClick}
      title={`View all posts tagged with ${name}`}
    >
      #{name.toLowerCase()}
      {count !== undefined && <span className="ml-1 text-xs text-purple-600">({count})</span>}
    </Link>
  )
}

export default Tag 