import type { UserProfile } from '@/app/profile/actions'

interface PersonnalInformationsProps {
  user: UserProfile
}

export default function PersonnalInformations({ user }: PersonnalInformationsProps) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-12 flex flex-col justify-between">
      <div>
        <h2 className="font-bold text-[#49C7FF] text-base mb-5 text-center">
          Informations personnelle
        </h2>
        <dl className="space-y-2 text-base">
          {[
            { label: 'Nom', value: user.lastName },
            { label: 'Prénom', value: user.firstName },
            { label: 'Adresse mail', value: user.email },
            { label: 'Date de naissance', value: user.birthDate },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <dt className="text-brand-border">{label}:</dt>
              <dd className="text-brand-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <button className="mt-5 w-full py-2 px-4 rounded-lg border border-brand-border text-brand-text text-base shadow-neon hover:scale-105 transition-all duration-200 active:scale-95">
        Modifier le mot de passe
      </button>
    </div>
  )
}
