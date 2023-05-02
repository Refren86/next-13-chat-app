import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { fetchRedis } from '@/helpers/redis';

type PageProps = {
  params: {
    chatId: string;
  };
};

// url: /chat/userId1--userId2

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1) // getting sorted list from start to end
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const reversedDbMessages = [...dbMessages].reverse();
    // const messages = ''
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split('--');

  if (user.id !== userId1 && user.id !== userId2) {
    notFound();
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;
  const chatPartner: User | null = await db.get(`user:${chatPartnerId}`);

  const initialMessages = await getChatMessages(chatId);

  return <>chatik</>;
};

export default page;
