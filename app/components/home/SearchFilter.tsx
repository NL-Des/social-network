export interface FilterItem {
  label: string
  count: number
}

export default function SearchFilter({ filters }: { filters: FilterItem[] }) {
  return (
    <aside className="h-full overflow-y-auto bg-brand-card border border-brand-border shadow-neon rounded-2xl p-5 flex flex-col gap-5">

      <div className="flex flex-col gap-3">
        {filters.map((filter) => (
          <button
            key={filter.label}
            className="flex items-center justify-between bg-black rounded-xl px-4 py-3 border border-transparent hover:border-brand-border transition-all cursor-pointer"
          >
            <span className="text-white text-lg">{filter.label}</span>
            <span className="bg-purple-600 text-white text-base rounded-full w-7 h-7 flex items-center justify-center font-bold">
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
