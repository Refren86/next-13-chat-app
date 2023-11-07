import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/helpers/redis';
import { messageArrayValidator } from '@/lib/validations/message';
import Messages from '@/components/Messages';
import ChatInput from '@/components/ChatInput';
import { getGroupChatByKey } from '@/helpers/get-group-chat-by-key';

type PageProps = {
  params: {
    chatId: string;
  };
};

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis('zrange', `group-chat:${chatId}:messages`, 0, -1); // getting sorted list from start to end
    const dbMessages = results.map((message) => JSON.parse(message) as Message);
    const reversedDbMessages = [...dbMessages].reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages); // validating all messages
    return messages;
  } catch (error) {
    notFound();
  }
}

const page = async ({ params }: PageProps) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);

  if (!session) notFound();

  const groupChatMembersIds: string[] = await fetchRedis('smembers', `group_chat:${chatId}:members`);
  const groupChatMembersRaw: string[] = await fetchRedis('mget', ...groupChatMembersIds.map((id) => `user:${id}`));
  const groupChatMembers = groupChatMembersRaw.map((member) => JSON.parse(member) as AppUser);

  // get group chat info
  const groupChatInfo = await getGroupChatByKey(`group_chat:${chatId}`);
  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative w-8 sm:w-12 h-8 sm:h-12">
            <div className="flex justify-center items-center w-full h-full rounded-full bg-emerald-700 text-white cursor-pointer">
              <h2>
                {groupChatInfo.chatName.length > 4
                  ? `${groupChatInfo.chatName.slice(0, 3)}...`
                  : groupChatInfo.chatName}
              </h2>
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className="text-gray-700 mr-3 font-semibold">{groupChatInfo.chatName}</span>
            </div>

            <span className="text-sm text-gray-600">Participants: {groupChatMembers.length}</span>
          </div>
        </div>
      </div>

      <Messages
        chatId={chatId}
        userImg={session.user.image}
        userId={session.user.id}
        initialMessages={initialMessages}
        isGroupChat
      />

      <ChatInput chatId={chatId} isGroupChat />
    </div>
  );
};

export default page;
