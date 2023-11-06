import { fetchRedis } from './redis';

export const getGroupChatByKey = async (key: string) => {
  const resultObject: Record<string, string> = {};

  const groupChatRawData: string[] = await fetchRedis('hgetall', key);

  for (let i = 0; i < groupChatRawData.length; i += 2) {
    const key = groupChatRawData[i];
    const value = groupChatRawData[i + 1];

    resultObject[key] = value;
  }

  const parsedGroupChat: GroupChat = JSON.parse(JSON.stringify(resultObject));

  return parsedGroupChat;
};
