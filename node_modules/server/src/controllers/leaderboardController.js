import Contestant from "../models/Contestant.js";

export async function getLeaderboard(req, res) {
  const list = await Contestant.find({})
    .sort({ score: -1, createdAt: 1 })
    .select("name teamName score projectLink")
    .lean();
  res.json(list);
}
