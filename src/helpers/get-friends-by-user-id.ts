import { fetchRedis } from './redis';

export const getFriendsByUserId = async (id: string) => {
  // get all ids and enrich them with users data
  const friendsIds: string[] = await fetchRedis('smembers', `user:${id}:friends`);

  const friends: User[] = await Promise.all(
    friendsIds.map(async (friendId) => {
      const friend: string = await fetchRedis('get', `user:${friendId}`);
      const parsedFriend: User = JSON.parse(friend);
      return parsedFriend;
    }),
  );

  return friends;
};
