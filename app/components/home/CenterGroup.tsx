import { GroupItem } from '@/app/components/home/LeftSidebarGroups'
import Button from '@/app/components/ui/button'

interface CenterGroupProps {
  group: GroupItem | null
}

export default function CenterGroup({ group }: CenterGroupProps) {
  if (!group) {
    return (
      <div className="h-full bg-brand-card border border-brand-border rounded-2xl flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm">Aucun groupe sélectionné.</p>
      </div>
    )
  }

  return (
    <div className="h-full bg-brand-card border border-brand-border rounded-2xl p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-base font-bold flex-shrink-0">
          {group.initials}
        </div>
        <div>
          <h3 className="font-retro text-purple-400 text-base">{group.name}</h3>
          <p className="text-brand-text text-xs">{group.membersCount} membres</p>
        </div>
      </div>
      <p className="text-brand-text text-lg leading-7 whitespace-pre-line mb-8">
        {group.description}
      </p>
      <div className="flex flex-col items-center gap-3">
        <Button className="">Entrer dans le Groupe</Button>
        <Button className="">Demander l'Accès au Groupe</Button>
      </div>
    </div>
  )
}
