import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { Icons } from '@/components/Icons';
import SignOutButton from '@/components/SignOutButton';
import SidebarChatList from '@/components/SidebarChatList';
import { getFriendsByUserId } from '@/helpers/get-friends-by-user-id';
import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions';
import MobileChatLayout from '@/components/MobileChatLayout';
import { SidebarOption } from '@/types/general';
import SidebarGroupChatList from '@/components/SidebarGroupChatList';
import { getGroupChatsByUserId } from '@/helpers/get-group-chats-by-user-id';
import { AppUser } from '@/mixins/AppUser';

type Props = {
  children: React.ReactNode;
};

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: 'Add friend',
    href: '/dashboard/add',
    Icon: 'UserPlus',
  },
  {
    id: 2,
    name: 'Create group',
    href: '/dashboard/group/create',
    Icon: 'Users',
  },
];

const Layout = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    notFound();
  }

  const friends = await getFriendsByUserId(session.user.id);
  const groupChats = await getGroupChatsByUserId(session.user.id);
  const incomingFriendRequests: AppUser[] = await fetchRedis(
    'smembers',
    `user:${session.user.id}:incoming_friend_requests`,
  );

  return (
    <>
      <div className="w-full flex h-screen">
        <div className="md:hidden">
          <MobileChatLayout
            friends={friends}
            groupChats={groupChats}
            session={session}
            sidebarOptions={sidebarOptions}
            unseenRequestCount={incomingFriendRequests.length}
          />
        </div>

        {/* Sidebar */}
        <div className="hidden md:flex h-full w-full max-w-sm grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <Link href="/dashboard" className="flex h-16 shrink-0 items-center">
            <Icons.Logo className="h-8 w-auto text-indigo-600" />
          </Link>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <SidebarGroupChatList groupChats={groupChats} userId={session.user.id} />
              </li>

              <li>
                <SidebarChatList friends={friends} userId={session.user.id} />
              </li>

              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400">Overview</div>

                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  {sidebarOptions.map((option) => {
                    const Icon = Icons[option.Icon];
                    return (
                      <li key={option.id}>
                        <Link
                          href={option.href}
                          className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                        >
                          <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white">
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="truncate">{option.name}</span>
                        </Link>
                      </li>
                    );
                  })}

                  {/* Friend requests */}
                  <li>
                    <FriendRequestSidebarOptions
                      userId={session.user.id}
                      initialUnseenReqCount={incomingFriendRequests.length}
                    />
                  </li>
                </ul>
              </li>

              <li className="-mx-6 mt-auto flex items-center">
                <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="relative h-8 w-8 bg-gray-50">
                    <Image
                      fill
                      referrerPolicy="no-referrer" // for images from google
                      className="rounded-full"
                      src={session.user?.image || ''}
                      alt="Your profile picture"
                    />
                  </div>

                  {/* Hide element but make it observable for screen readers */}
                  <span className="sr-only">Your profile</span>

                  <div className="flex flex-col">
                    <span aria-hidden="true">{session.user.name}</span>
                    <span className="text-xs text-zinc-400" aria-hidden="true">
                      {session.user.email}
                    </span>
                  </div>
                </div>

                <SignOutButton className="h-full aspect-square" />
              </li>
            </ul>
          </nav>
        </div>

        <aside className="max-h-screen container py-16 md:py-12 w-full">{children}</aside>
      </div>
    </>
  );
};

export default Layout;
