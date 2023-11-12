import { fetchRedis } from './redis';
import { AppUser } from '@/mixins/AppUser';

export const getFriendsByUserId = async (id: string) => {
  // get all ids and enrich them with users data
  const friendsIds: string[] = await fetchRedis('smembers', `user:${id}:friends`);

  const friends: AppUser[] = await Promise.all(
    friendsIds.map(async (friendId) => {
      const friend: string = await fetchRedis('get', `user:${friendId}`);
      const parsedFriend: AppUser = JSON.parse(friend);
      return parsedFriend;
    }),
  );

  return friends;
};
