export interface Group {
  id: string
  name: string
  membersCount: string
}

export interface SidebarUser {
  id: string
  name: string
  initials: string
  online: boolean
}

interface RightSidebarProps {
  groups: Group[]
  users: SidebarUser[]
}

export default function RightSidebar({ groups, users }: RightSidebarProps) {
  return (
    <aside className="h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-6">
      <section>
        <h2 className="font-retro text-brand-text text-base mb-5">Mes Groupes</h2>
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
              <div>
                <p className="text-white text-lg font-semibold">{group.name}</p>
                <p className="text-brand-text text-base">{group.membersCount} membres</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-retro text-brand-text text-base mb-5">Utilisateurs</h2>
        <div className="flex flex-col gap-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <div className="relative flex-shrink-0 flex items-center">
                {user.online && (
                  <span className="absolute -left-3 w-2 h-2 bg-green-500 rounded-full" />
                )}
                <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold">
                  {user.initials}
                </div>
              </div>
              <p className="text-white text-lg">{user.name}</p>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
