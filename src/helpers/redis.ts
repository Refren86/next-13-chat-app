const upstashRedisURL = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// zrange is used to retrieve a range of elements from a sorted set.
// sismember is used to check if a member exists in a set.
// get is used to retrieve the value of a key.
// smembers is used to retrieve all members of a set.

type RedisCommands = 'zrange' | 'sismember' | 'get' | 'smembers';

export async function fetchRedis(command: RedisCommands, ...args: (string | number)[]) {
  const commandUrl = `${upstashRedisURL}/${command}/${args.join('/')}`;

  // getting user id from upstash db
  const response = await fetch(commandUrl, {
    headers: { Authorization: `Bearer ${upstashRedisRestToken}` },
    cache: 'no-store', // will not cache the response
  });

  if (!response.ok) {
    throw new Error('Error executing redis command: ' + response.statusText)
  }

  const data = await response.json();
  return data.result;
}
