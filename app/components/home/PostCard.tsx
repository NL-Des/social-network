export interface Post {
  id: string
  author: {
    name: string
    initials: string
  }
  content: string
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-brand-card border border-brand-border shadow-neon rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {post.author.initials}
        </div>
        <h3 className="font-retro text-purple-400 text-xs">
          {post.author.name}
        </h3>
      </div>
      <p className="text-brand-text text-sm leading-7 whitespace-pre-line">
        {post.content}
      </p>
    </div>
  )
}
