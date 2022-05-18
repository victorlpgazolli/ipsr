// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import redis from "../../../../services/redis"

export default async function handler(req, res) {
    const packages = await redis.keys("v0:package:*");
    res.status(200).json({ packages })
}
