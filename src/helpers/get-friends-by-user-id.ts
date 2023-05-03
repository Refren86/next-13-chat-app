import { fetchRedis } from './redis';

export const getFriendsByUserId = async (id: string) => {
  // get all ids and enrich them with users data
  const friendsIds: string[] = await fetchRedis('smembers', `user:${id}:friends`);

  const friendsResponse: string[] = await Promise.all(
    friendsIds.map(async (friendId) => {
      const friend: string = await fetchRedis('get', `user:${friendId}`);
      return friend;
    }),
  );

  const friends: User[] = friendsResponse.map(friend => JSON.parse(friend));

  return friends;
};
