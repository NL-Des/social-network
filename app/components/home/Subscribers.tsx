import type { Contact } from '@/app/profile/actions'
import { ContactRow } from './Followers'

interface SubscribersProps {
  followers: Contact[]
}

export default function Subscribers({ followers }: SubscribersProps) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
      <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
        Abonnés
      </h2>
      <div className="flex flex-col gap-1">
        {followers.map((c) => (
          <ContactRow key={c.id} contact={c} onRemove={() => {}} />
        ))}
      </div>
    </div>
  )
}
