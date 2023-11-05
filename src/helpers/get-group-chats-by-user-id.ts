import { fetchRedis } from './redis';

export const getGroupChatsByUserId = async (userId: string) => {
  // get all ids and enrich them with users data
  const groupChatsKeys: string[] = await fetchRedis('smembers', `user:${userId}:group_chats`);

  const groupChats: GroupChat[] = await Promise.all(
    groupChatsKeys.map(async (key) => {
      const groupChatData: string[] = await fetchRedis('hgetall', key);

      const resultObject: Record<string, string> = {};

      for (let i = 0; i < groupChatData.length; i += 2) {
        const key = groupChatData[i];
        const value = groupChatData[i + 1];

        resultObject[key] = value;
      }

      const parsedGroupChats: GroupChat = JSON.parse(JSON.stringify(resultObject));
      return parsedGroupChats;
    }),
  );

  return groupChats;
};
