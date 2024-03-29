import axios from 'axios';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import CreateGroupForm from '@/components/CreateGroupForm';
import { AppUser } from '@/mixins/AppUser';

async function getData(userId: string) {
  try {
    console.log("Host ?", process.env.NEXT_PUBLIC_HOST);
    
    const friends = await axios.post(process.env.NEXT_PUBLIC_HOST! + '/api/friends/getAll', { userId });

    return friends.data;
  } catch (error) {
    console.log('Error getting friends:', error);
    return [];
  }
}

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const friends: AppUser[] = await getData(session.user.id);

  return (
    <section className="pt-8">
      <h2 className="font-bold text-5xl mb-8">Create a group</h2>

      <CreateGroupForm friends={friends} />
    </section>
  );
}
