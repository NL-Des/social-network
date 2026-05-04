"use client";

import { useState, useEffect } from "react";
import profileAction from "./actions";
import type { ProfilePageProps, Contact, Event, Group, NavItem } from "./actions";

function Avatar({
  initials,
  size = "lg",
  isOnline,
}: {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
}) {
  const sizes = {
    sm: "w-9 h-9 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-44 h-44 text-5xl",
  };
  return (
    <div className="relative inline-flex">
      <div
        className={`${sizes[size]} rounded-full bg-gray-600 flex items-center justify-center font-bold text-white ring-2 ring-brand-border/40 shadow-neon-panel`}
      >
        {initials}
      </div>
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-brand-card ${
            isOnline ? "bg-green-400" : "bg-slate-500"
          }`}
        />
      )}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-brand-border bg-brand-card shadow-neon ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-retro text-brand-border text-sm mb-4 tracking-wide">
      {children}
    </h2>
  );
}

function ContactRow({
  contact,
  onRemove,
}: {
  contact: Contact;
  onRemove?: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <Avatar initials={contact.initials} size="sm" isOnline={contact.isOnline} />
      <span className="text-brand-text text-base flex-1">{contact.name}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(contact.id)}
          className="text-red-500 hover:text-red-400 opacity-70 group-hover:opacity-100 transition-opacity text-base leading-none"
          aria-label={`Retirer ${contact.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function ProfilePage({
  user,
  following,
  followers,
  events,
  groups,
  allUsers,
  navItems,
  visibility: initialVisibility = "public",
}: ProfilePageProps) {
  const [visibility, setVisibility] = useState<"private" | "public">(initialVisibility);

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-border/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-border/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 mx-4 mt-4 mb-8">
        <nav className="rounded-2xl border border-brand-border bg-brand-card px-6 py-3 flex items-center justify-between shadow-neon">
          <div className="flex items-center gap-3">
            <Avatar initials={user.initials} size="sm" />
            <div>
              <p className="text-white font-semibold text-base leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-brand-text text-sm">
                @{user.username} · {user.followersCount} abonnés
              </p>
            </div>
          </div>
          <ul className="flex items-center gap-8">
            {navItems.map((item: NavItem) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-brand-text hover:text-white transition-colors text-base font-medium"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main */}
      <main className="relative z-10 px-4 pb-12 grid grid-cols-[1fr_320px] gap-6 max-w-7xl mx-auto">
        <div className="space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-[auto_1fr_1fr] gap-6 items-start">
            {/* Big Avatar */}
            <div className="flex items-center justify-center mt-2">
              <div className="w-44 h-44 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30">
                <span className="text-5xl font-extrabold text-white tracking-tight">
                  {user.initials}
                </span>
              </div>
            </div>

            {/* Personal Info */}
            <Card className="p-6 h-full flex flex-col justify-between">
              <div>
                <SectionTitle>Informations personnelles</SectionTitle>
                <dl className="space-y-1.5 text-base">
                  {[
                    { label: "Nom", value: user.lastName },
                    { label: "Prénom", value: user.firstName },
                    { label: "Adresse mail", value: user.email },
                    { label: "Date de naissance", value: user.birthDate },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-1">
                      <dt className="text-brand-border/70 min-w-32">{label}:</dt>
                      <dd className="text-brand-text">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="mt-5">
                <button className="w-full py-2 px-4 rounded-lg border border-slate-500 text-brand-text text-base hover:border-brand-border hover:text-brand-border hover:shadow-neon-panel transition-all duration-200 active:scale-95">
                  Modifier le mot de passe
                </button>
              </div>
            </Card>

            {/* Visibility */}
            <Card className="p-6 h-full">
              <SectionTitle>Visibilité</SectionTitle>
              <p className="text-brand-text text-base mb-4">Choix de la visibilité:</p>
              <div className="space-y-3">
                {(["private", "public"] as const).map((option) => (
                  <label
                    key={option}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <span className="text-brand-text text-base capitalize">
                      {option === "private" ? "Privée" : "Publique"}
                    </span>
                    <div className="relative">
                      <input
                        type="radio"
                        name="visibility"
                        value={option}
                        checked={visibility === option}
                        onChange={() => setVisibility(option)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          visibility === option
                            ? "border-brand-border bg-brand-border shadow-neon"
                            : "border-slate-500 bg-transparent group-hover:border-slate-400"
                        }`}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="p-5">
              <SectionTitle>Suivi(e)s</SectionTitle>
              <div className="space-y-0.5">
                {following.map((contact: Contact) => (
                  <ContactRow key={contact.id} contact={contact} onRemove={() => {}} />
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle>Abonnés</SectionTitle>
              <div className="space-y-0.5">
                {followers.map((contact: Contact) => (
                  <ContactRow key={contact.id} contact={contact} onRemove={() => {}} />
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <SectionTitle>Évènements</SectionTitle>
              <div className="space-y-2">
                {events.map((event: Event) => (
                  <div key={event.id} className="flex items-center gap-3 py-1 group">
                    <div className="w-9 h-9 rounded-full bg-slate-700 ring-1 ring-brand-border/30 flex items-center justify-center text-xs font-bold text-brand-text shrink-0">
                      {event.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-bold truncate font-retro ${event.color ?? "text-brand-text"}`}>
                        {event.title}
                      </p>
                      <p className="text-brand-text/60 text-sm truncate">{event.subtitle}</p>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-400 opacity-70 group-hover:opacity-100 transition-opacity text-base leading-none"
                      aria-label={`Retirer ${event.title}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          <Card className="p-5">
            <SectionTitle>Mes Groupes</SectionTitle>
            <div className="space-y-3">
              {groups.map((group: Group) => (
                <div key={group.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 ring-1 ring-brand-border/20 flex items-center justify-center text-xs font-bold text-white">
                    {group.initials}
                  </div>
                  <div>
                    <p className="text-white text-base font-semibold leading-tight">{group.name}</p>
                    <p className="text-brand-text/60 text-sm">{group.memberCount} membres</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle>Utilisateurs</SectionTitle>
            <div className="space-y-1">
              {allUsers.map((u: Contact) => (
                <div key={u.id} className="flex items-center gap-3 py-1">
                  <Avatar initials={u.initials} size="sm" isOnline={u.isOnline} />
                  <span className="text-brand-text text-base">{u.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </main>
    </div>
  );
}

export default function Page() {
  const [data, setData] = useState<ProfilePageProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    profileAction()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger le profil.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-400">{error ?? "Données introuvables."}</p>
      </div>
    );
  }

  return <ProfilePage {...data} />;
}
