'use client';

import { useState, useEffect } from 'react';
import Header, { CurrentUser } from '@/app/components/home/Header';
import RightSidebar, { Group, SidebarUser } from '@/app/components/home/RightSidebar';
import PersonnalInformations from '@/app/components/home/PersonnalInformations';
import VisibilityAccount from '@/app/components/home/VisibilityAccount';
import Followers from '@/app/components/home/Followers';
import Subscribers from '@/app/components/home/Subscribers';
import PostCard, { Post } from '@/app/components/home/PostCard';
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

const mockUserPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Miaou', initials: 'NL' },
    content: `Première semaine sur le projet réseau social 🚀\nLes fondations du front sont en place, Next.js tourne bien.\nHâte d'attaquer l'intégration avec le back Go !`,
  },
  {
    id: '2',
    author: { name: 'Miaou', initials: 'NL' },
    content: `Retour sur Tailwind CSS après quelques jours d'utilisation 🎨\nLa logique utilitaire fait vraiment gagner du temps sur la mise en page.\nPas de CSS custom, tout reste cohérent et lisible.`,
  },
  {
    id: '3',
    author: { name: 'Miaou', initials: 'NL' },
    content: `PostgreSQL + Go, un duo redoutable ⚙️\nLes requêtes sont rapides et le typage fort côté Go évite beaucoup d'erreurs.\nVivement la phase d'intégration complète.`,
  },
  {
    id: '4',
    author: { name: 'Miaou', initials: 'NL' },
    content: `PostgreSQL + Go, un duo redoutable ⚙️\nLes requêtes sont rapides et le typage fort côté Go évite beaucoup d'erreurs.\nVivement la phase d'intégration complète.`,
  },
  {
    id: '5',
    author: { name: 'Miaou', initials: 'NL' },
    content: `PostgreSQL + Go, un duo redoutable ⚙️\nLes requêtes sont rapides et le typage fort côté Go évite beaucoup d'erreurs.\nVivement la phase d'intégration complète.`,
  },
];

const mockData: ProfilePageProps = {
  user: {
    firstName: 'Nathan',
    lastName: 'Leonard',
    username: 'nleonard',
    email: 'nathan33.travail@gmail.com',
    birthDate: '01/01/2000',
    followersCount: 5,
    initials: 'NL',
  },
  visibility: 'public',
  following: [
    { id: '1', name: 'Audrey D', initials: 'AD' },
    { id: '2', name: 'Jade C', initials: 'JC' },
    { id: '3', name: 'Nathan L', initials: 'NL' },
    { id: '4', name: 'Nathan P', initials: 'NP' },
    { id: '5', name: 'Valentine L', initials: 'VL' },
  ],
  followers: [
    { id: '1', name: 'Audrey D', initials: 'AD' },
    { id: '2', name: 'Jade C', initials: 'JC' },
    { id: '3', name: 'Nathan L', initials: 'NL' },
    { id: '4', name: 'Nathan P', initials: 'NP' },
    { id: '5', name: 'Valentine L', initials: 'VL' },
  ],
  events: [],
  groups: [],
  allUsers: [],
  navItems: [],
};

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

            {/* Ligne basse : suivi(e)s + abonnés + posts */}
            <div className="flex-1 grid grid-cols-3 gap-15 overflow-hidden">
              <Followers following={data.following} />
              <Subscribers followers={data.followers} />
              <div className="overflow-y-auto flex flex-col gap-4">
                {mockUserPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
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
  const [data, setData] = useState<ProfilePageProps>(mockData);

  useEffect(() => {
    profileAction()
      .then((result) => setData(result))
      .catch(() => {});
  }, []);

  const headerUser: CurrentUser = {
    name: `${data.user.firstName} ${data.user.lastName[0]}.`,
    username: data.user.username,
    followers: data.user.followersCount,
    initials: data.user.initials,
  };

  return <ProfileContent data={data} headerUser={headerUser} />;
}
