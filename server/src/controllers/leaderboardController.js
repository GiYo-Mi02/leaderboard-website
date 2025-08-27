import Contestant from "../models/Contestant.js";

export async function getLeaderboard(req, res) {
  const list = await Contestant.aggregate([
    { $sort: { score: -1, createdAt: 1 } },
    {
      $lookup: {
        from: "users",
        let: { cEmail: "$email" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $toLower: "$email" }, { $toLower: "$$cEmail" }],
              },
            },
          },
          { $project: { avatarUrl: 1, bio: 1, place: 1 } },
          { $limit: 1 },
        ],
        as: "_user",
      },
    },
    { $addFields: { profile: { $arrayElemAt: ["$_user", 0] } } },
    {
      $project: {
        name: 1,
        teamName: 1,
        title: 1,
        score: 1,
        projectLink: 1,
        description: 1,
        screenshotUrl: 1,
        createdAt: 1,
        profile: 1,
      },
    },
  ]).exec();

  // Attach fastest submission flag based on earliest createdAt across the list
  const withDates = list.filter((c) => !!c.createdAt);
  let fastestId = null;
  if (withDates.length) {
    let min = withDates[0];
    for (const c of withDates) {
      if (new Date(c.createdAt) < new Date(min.createdAt)) min = c;
    }
    fastestId = String(min._id);
  }
  const out = list.map((c) => ({
    ...c,
    _fastest: fastestId && String(c._id) === fastestId,
  }));
  res.json(out);
}
