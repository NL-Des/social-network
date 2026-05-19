'use client';

import { useState, useEffect } from 'react';
import Header, { CurrentUser } from '@/app/components/home/Header';
import RightSidebar, { Group, SidebarUser } from '@/app/components/home/RightSidebar';
import PersonnalInformations from '@/app/components/home/PersonnalInformations';
import VisibilityAccount from '@/app/components/home/VisibilityAccount';
import Followers from '@/app/components/home/Followers';
import Subscribers from '@/app/components/home/Subscribers';
import Events from '@/app/components/home/Events';
import profileAction from './actions';
import type { ProfilePageProps } from './actions';

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890' },
  { id: '2', name: 'Dev Frontend', membersCount: '3,4k' },
  { id: '3', name: 'Design & UX', membersCount: '1,2k' },
];

const mockSidebarUsers: SidebarUser[] = [
  { id: '1', name: 'Audrey D', initials: 'AD', online: true },
  { id: '2', name: 'Jade C', initials: 'JC', online: true },
  { id: '3', name: 'Mathis P', initials: 'MP', online: false },
  { id: '4', name: 'Nathan L', initials: 'NL', online: false },
  { id: '5', name: 'Nathan P', initials: 'NP', online: false },
  { id: '6', name: 'Valentine L', initials: 'VL', online: false },
];

function ProfileContent({
  data,
  headerUser,
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

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-[1fr_264px] gap-15 pt-4 h-full">
          {/* Contenu principal */}
          <div className="flex flex-col gap-15 h-full">
            {/* Ligne haute : avatar + informations + visibilité */}
            <div className="flex-1 grid grid-cols-[auto_1fr_1fr] gap-15 items-stretch">
              {/* Grand avatar */}
              <div className="flex items-center justify-center px-4">
                <div className="w-100 h-100 rounded-full bg-gray-600 flex items-center justify-center shadow-neon ring-4 ring-brand-border/30">
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    {data.user.initials}
                  </span>
                </div>
              </div>

              <PersonnalInformations user={data.user} />
              <VisibilityAccount visibility={visibility} onChange={setVisibility} />
            </div>

            {/* Ligne basse : suivi(e)s + abonnés + évènements */}
            <div className="flex-1 grid grid-cols-3 gap-15">
              <Followers following={data.following} />
              <Subscribers followers={data.followers} />
              <Events events={data.events} />
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
    initials: data.user.initials,
  };

  return <ProfileContent data={data} headerUser={headerUser} />;
}
