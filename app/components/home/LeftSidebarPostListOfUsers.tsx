import Link from 'next/link'

export interface SidebarUser {
  id: string
  name: string
  initials: string
  online: boolean
  following?: boolean
}

interface LeftSidebarPostListOfUsersProps {
  users: SidebarUser[]
}

export default function LeftSidebarPostListOfUsers({ users }: LeftSidebarPostListOfUsersProps) {
  return (
    <aside className="h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-6">
      <section>
        <h2 className="font-bold text-[#49C7FF] text-base mb-5">Participants à la discussion</h2>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 hover:bg-white/5 transition-colors"
            >
              <div className="relative flex-shrink-0 flex items-center">
                {user.online && (
                  <span className="absolute -left-3 w-2 h-2 bg-green-500 rounded-full" />
                )}
                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold">
                  {user.initials}
                </div>
              </div>
              <p className="text-white text-lg">{user.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}
