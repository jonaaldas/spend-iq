import Redis from 'ioredis'

const client = new Redis(
  'rediss://default:Ad7oAAIjcDE1YmJiZDM3ZmYyZWY0MGI2YTk3N2Q0ZjEwNjU3MWViNnAxMA@adjusted-gazelle-57064.upstash.io:6379'
)

export default client
