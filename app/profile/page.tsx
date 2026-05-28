'use client'

import { useState, useEffect } from 'react';
import Header, { CurrentUser } from '@/app/components/home/Header';
import RightSidebar, { Group, SidebarUser } from '@/app/components/home/RightSidebar';
import PersonnalInformations from '@/app/components/home/PersonnalInformations';
import VisibilityAccount from '@/app/components/home/VisibilityAccount';
import Followers from '@/app/components/home/Followers';
import Subscribers from '@/app/components/home/Subscribers';
import PostCard, { Post } from '@/app/components/home/PostCard';
import profileAction from './actions';
import { useRouter } from 'next/navigation';
import type { ProfilePageProps } from './actions';
import ErrorBanner from '@/app/components/ui/errorBanner';
import { BackendError } from '@/app/types/api'

const mockGroups: Group[] = [
  { id: '1', name: 'Photo Urbaine', membersCount: '890' },
  { id: '2', name: 'Dev Frontend', membersCount: '3,4k' },
  { id: '3', name: 'Design & UX', membersCount: '1,2k' },
];

const mockUserPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Moi', initials: 'ME' },
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    id: '2',
    author: { name: 'Moi', initials: 'ME' },
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  },
]

const mockData: ProfilePageProps = {
  user: {
    firstName: 'Nathan',
    lastName: 'Leonard',
    username: 'nathan_lnd',
    email: 'nathan@example.com',
    birthDate: '1998-05-12',
    followersCount: 142,
    initials: 'NL',
  },
  visibility: 'public',
  following: [
    { id: '1', name: 'Audrey D',    initials: 'AD' },
    { id: '2', name: 'Jade C',      initials: 'JC' },
    { id: '3', name: 'Nathan L',    initials: 'NL' },
    { id: '4', name: 'Nathan P',    initials: 'NP' },
    { id: '5', name: 'Valentine L', initials: 'VL' },
  ],
  followers: [
    { id: '1', name: 'Audrey D',    initials: 'AD' },
    { id: '2', name: 'Jade C',      initials: 'JC' },
    { id: '3', name: 'Nathan L',    initials: 'NL' },
    { id: '4', name: 'Nathan P',    initials: 'NP' },
    { id: '5', name: 'Valentine L', initials: 'VL' },
  ],
  events: [],
  groups: [],
  allUsers: [],
  navItems: [],
}

function ProfileContent({ data, headerUser }: { data: ProfilePageProps; headerUser: CurrentUser }) {
  const [visibility, setVisibility] = useState<'private' | 'public'>(data.visibility ?? 'public')

  return (
    <div className="w-full min-h-screen bg-background p-4 flex flex-col gap-6 font-sans">
      <Header user={headerUser} />

      <div className="pt-26 flex-1 overflow-hidden px-4 pb-4">
        <div className="grid grid-cols-[1fr_264px] gap-15 pt-4 h-full">

          <div className="flex flex-col gap-15 h-full">
            <div className="flex-1 grid grid-cols-[auto_1fr_1fr] gap-15 items-stretch">
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

          <div className="h-full">
            <RightSidebar groups={mockGroups} />
          </div>

        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [data, setData] = useState<ProfilePageProps>(mockData);
const [globalError, setGlobalError] = useState<BackendError | null>(null);
  const router = useRouter();

  useEffect(() => {
  profileAction().then((result) => {
    if (result.success) {
      setData(result.data);
    } else {
      const backendError = result.error as BackendError;

      // Redirection automatique si le code d'erreur est UNAUTHORIZED
      if (backendError.code === 'UNAUTHORIZED') {
        router.push('/auth/login');
      } else {
        // Pour toutes les autres erreurs (INTERNAL, INVALID_INPUT...), on enregistre l'objet complet
        setGlobalError(backendError);
      }
    }
  });
}, [router]);

  const headerUser: CurrentUser = {
    name: `${data.user.firstName} ${data.user.lastName[0]}.`,
    username: data.user.username,
    followers: data.user.followersCount,
    initials: data.user.initials,
  }

  return (
    <>
      {globalError && (
        <ErrorBanner 
          message={globalError.message} 
          // Si c'est une simple erreur de saisie (INVALID_INPUT), on met un avertissement, sinon critique (500, etc.)
          type={globalError.code === 'INVALID_INPUT' ? 'warning' : 'critical'}
          onClose={() => setGlobalError(null)}
          autoCloseDuration={5000} // Optionnel : se ferme tout seul après 5 secondes
        />
      )}
      <ProfileContent data={data} headerUser={headerUser} />
    </>
  );
}
