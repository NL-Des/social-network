interface VisibilityAccountProps {
  visibility: 'private' | 'public'
  onChange: (value: 'private' | 'public') => void
}

export default function VisibilityAccount({ visibility, onChange }: VisibilityAccountProps) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl p-12">
      <h2 className="font-bold text-[#49C7FF] text-base mb-5 text-center">
        Visibilité
      </h2>
      <p className="text-brand-text text-base mb-4">Choix de la visibilité:</p>
      <div className="space-y-4">
        {(['private', 'public'] as const).map((option) => (
          <label key={option} className="flex items-center justify-between cursor-pointer">
            <span className="text-brand-text text-base">
              {option === 'private' ? 'Privé' : 'Publique'}
            </span>
            <div className="relative">
              <input
                type="radio"
                name="visibility"
                value={option}
                checked={visibility === option}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  visibility === option
                    ? 'border-brand-border bg-brand-border shadow-neon'
                    : 'border-slate-500 bg-transparent'
                }`}
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
