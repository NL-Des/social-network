import type { Contact } from '@/app/profile/actions'

export function ContactRow({
  contact,
  onRemove,
}: {
  contact: Contact
  onRemove?: () => void
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {contact.initials}
      </div>
      <span className="text-brand-text text-base flex-1">{contact.name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-400 transition-colors text-lg leading-none"
          aria-label={`Retirer ${contact.name}`}
        >
          ×
        </button>
      )}
    </div>
  )
}

interface FollowersProps {
  following: Contact[]
}

export default function Followers({ following }: FollowersProps) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-5">
      <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
        Suivi(e)s
      </h2>
      <div className="flex flex-col gap-1">
        {following.map((c) => (
          <ContactRow key={c.id} contact={c} onRemove={() => {}} />
        ))}
      </div>
    </div>
  )
}
