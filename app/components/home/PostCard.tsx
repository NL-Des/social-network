export interface Post {
  id: string
  author: {
    name: string
    initials: string
  }
  content: string
}

import Link from 'next/link'

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/Post?id=${post.id}`} className="block bg-brand-card border border-brand-border rounded-2xl p-6 hover:border-brand-border/80 hover:shadow-neon transition-all cursor-pointer">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
          {post.author.initials}
        </div>
        <h3 className="font-retro text-purple-400 text-base">
          {post.author.name}
        </h3>
      </div>
      <p className="text-brand-text text-lg leading-7 whitespace-pre-line">
        {post.content}
      </p>
    </Link>
  )
}
