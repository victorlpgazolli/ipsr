// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
    const { slug } = req.query;
    const [author, packageName] = slug;
    const packageSlug = [author, packageName].join("/");
    res.status(200).json({ name: packageSlug })
}
