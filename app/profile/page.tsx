'use client';

import {useState, useEffect} from 'react';
import Header, {CurrentUser} from '@/app/components/home/Header';
import RightSidebar, {
  Group,
  SidebarUser
} from '@/app/components/home/RightSidebar';
import profileAction from './actions';
import type {ProfilePageProps, Contact, Event} from './actions';

const mockGroups: Group[] = [
  {id: '1', name: 'Photo Urbaine', membersCount: '890'},
  {id: '2', name: 'Dev Frontend', membersCount: '3,4k'},
  {id: '3', name: 'Design & UX', membersCount: '1,2k'}
];

const mockSidebarUsers: SidebarUser[] = [
  {id: '1', name: 'Audrey D', initials: 'AD', online: true},
  {id: '2', name: 'Jade C', initials: 'JC', online: true},
  {id: '3', name: 'Mathis P', initials: 'MP', online: false},
  {id: '4', name: 'Nathan L', initials: 'NL', online: false},
  {id: '5', name: 'Nathan P', initials: 'NP', online: false},
  {id: '6', name: 'Valentine L', initials: 'VL', online: false}
];

function ContactRow({
  contact,
  onRemove
}: {
  contact: Contact;
  onRemove?: () => void;
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
  );
}

function ProfileContent({
  data,
  headerUser
}: {
  data: ProfilePageProps;
  headerUser: CurrentUser;
}) {
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    data.visibility ?? 'public'
  );

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Header user={headerUser} />

      <div className="pt-[104px] flex-1 overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-[1fr_264px] gap-15 pt-4 h-full">
          {/* Contenu principal */}
          <div className="flex flex-col gap-15 h-full">
            {/* Ligne haute : avatar + info + visibilité */}
            <div className="flex-1 grid grid-cols-[auto_1fr_1fr] gap-15 items-stretch">
              {/* Grand avatar */}
              <div className="flex items-center justify-center px-4">
                <div className="w-100 h-100 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30">
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    {data.user.initials}
                  </span>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="bg-brand-card border border-brand-border rounded-2xl p-12 flex flex-col justify-between">
                <div>
                  <h2 className="font-bold text-[#49C7FF] text-base mb-5 text-center">
                    Informations personnelle
                  </h2>
                  <dl className="space-y-2 text-base">
                    {[
                      {label: 'Nom', value: data.user.lastName},
                      {label: 'Prénom', value: data.user.firstName},
                      {label: 'Adresse mail', value: data.user.email},
                      {label: 'Date de naissance', value: data.user.birthDate}
                    ].map(({label, value}) => (
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

              {/* Visibilité */}
              <div className="bg-brand-card border border-brand-border  rounded-2xl p-12">
                <h2 className="font-bold text-[#49C7FF] text-base mb-5 text-center">
                  Visibilité
                </h2>
                <p className="text-brand-text text-base mb-4">
                  Choix de la visibilité:
                </p>
                <div className="space-y-4">
                  {(['private', 'public'] as const).map((option) => (
                    <label
                      key={option}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-brand-text text-base">
                        {option === 'private' ? 'Privé' : 'Publique'}
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
                              ? 'border-brand-border bg-brand-border shadow-neon'
                              : 'border-slate-500 bg-transparent'
                          }`}
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Ligne basse : suivi(e)s + abonnés + évènements */}
            <div className="flex-1 grid grid-cols-3 gap-15">
              {/* Suivi(e)s */}
              <div className="bg-brand-card border border-brand-border  rounded-2xl p-5">
                <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
                  Suivi(e)s
                </h2>
                <div className="flex flex-col gap-1">
                  {data.following.map((c: Contact) => (
                    <ContactRow key={c.id} contact={c} onRemove={() => {}} />
                  ))}
                </div>
              </div>

              {/* Abonnés */}
              <div className="bg-brand-card border border-brand-border  rounded-2xl p-5">
                <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
                  Abonnés
                </h2>
                <div className="flex flex-col gap-1">
                  {data.followers.map((c: Contact) => (
                    <ContactRow key={c.id} contact={c} onRemove={() => {}} />
                  ))}
                </div>
              </div>

              {/* Évènements */}
              <div className="bg-brand-card border border-brand-border  rounded-2xl p-5">
                <h2 className="font-bold text-[#49C7FF] text-base mb-4 text-center">
                  Évènements
                </h2>
                <div className="flex flex-col gap-2">
                  {data.events.map((e: Event) => (
                    <div key={e.id} className="flex items-center gap-3 py-1">
                      <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {e.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-retro text-brand-border text-xs truncate">
                          {e.title}
                        </p>
                        <p className="text-brand-text text-sm truncate">
                          {e.subtitle}
                        </p>
                      </div>
                      <button className="text-red-500 hover:text-red-400 transition-colors text-lg leading-none">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar droite */}
          <div className="h-full">
            <RightSidebar groups={mockGroups} users={mockSidebarUsers} />
          </div>
        </div>
      </div>
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
        setError('Impossible de charger le profil.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-brand-text font-retro text-sm animate-pulse">
          Chargement...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-red-400">{error ?? 'Données introuvables.'}</p>
      </div>
    );
  }

  const headerUser: CurrentUser = {
    name: `${data.user.firstName} ${data.user.lastName[0]}.`,
    username: data.user.username,
    followers: data.user.followersCount,
    initials: data.user.initials
  };

  return <ProfileContent data={data} headerUser={headerUser} />;
}
