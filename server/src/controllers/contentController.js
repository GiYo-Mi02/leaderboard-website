import Content from "../models/Content.js";

export async function getContent(req, res) {
  const doc = (await Content.findOne({})) || (await Content.create({}));
  res.json(doc);
}

export async function updateContent(req, res) {
  const { rules, prizes, timeline } = req.body;
  const doc = await Content.findOneAndUpdate(
    {},
    { rules, prizes, timeline },
    { new: true, upsert: true }
  );
  res.json(doc);
}
