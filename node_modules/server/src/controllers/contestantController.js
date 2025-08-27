import Contestant from "../models/Contestant.js";

function escapeRegExp(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Create or update (idempotent) registration for the authenticated user
export async function register(req, res) {
  try {
    let { name, email, teamName, title, projectLink, description } = req.body;
    name = typeof name === "string" ? name.trim() : name;
    const authEmail = (req.user?.email || "").trim().toLowerCase();
    const bodyEmail = (email || "").trim().toLowerCase();
    // Force using authenticated email; block attempts to register another email
    if (bodyEmail && authEmail && bodyEmail !== authEmail) {
      return res
        .status(400)
        .json({ error: "Email mismatch with your account" });
    }
    email = authEmail || bodyEmail;
    console.log("[register] attempt", {
      authEmail: req.user?.email,
      bodyEmail: req.body?.email,
      email,
    });
    title = typeof title === "string" ? title.trim() : title;
    projectLink =
      typeof projectLink === "string" ? projectLink.trim() : projectLink;
    if (!name || !email || !title || !projectLink) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Do not include `email` in $set to avoid ConflictingUpdateOperators; set only on insert
    const patch = { name, teamName, title, projectLink, description };
    if (req.file) {
      patch.screenshotUrl = `/uploads/${
        req.file.filename ||
        req.file.path?.split("\\").pop() ||
        req.file.path?.split("/").pop()
      }`;
    }

    // First, try to find an existing record using exact equality with case-insensitive collation
    const legacy = await Contestant.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });
    if (legacy) {
      const updated = await Contestant.findByIdAndUpdate(legacy._id, patch, {
        new: true,
      });
      return res.status(200).json({ id: updated._id, updated: true });
    }

    // Atomic upsert keyed by email (case-insensitive collation) to avoid false duplicates and races
    const result = await Contestant.findOneAndUpdate(
      { email },
      { $set: patch, $setOnInsert: { email, score: 0 } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        rawResult: true,
        collation: { locale: "en", strength: 2 },
      }
    );
    console.log(
      "[register] upsert result lastErrorObject:",
      result?.lastErrorObject
    );
    const updatedExisting = result?.lastErrorObject?.updatedExisting;
    const doc = result?.value || result; // value exists when rawResult=true
    if (updatedExisting) {
      return res.status(200).json({ id: doc._id || doc?.id, updated: true });
    }
    return res.status(201).json({ id: doc._id || doc?.id, created: true });
  } catch (e) {
    if (e && e.code === 11000) {
      console.error("Duplicate key on Contestant:", {
        message: e?.message,
        keyValue: e?.keyValue,
        index: e?.keyPattern || e?.keyValue,
      });
      try {
        const rawEmail = (req.user?.email || req.body?.email || "").trim();
        // Find case-insensitively (handles legacy records with different casing)
        const existing = await Contestant.findOne({
          email: rawEmail,
        }).collation({
          locale: "en",
          strength: 2,
        });
        if (existing) {
          // Bring it to the latest data
          const patch = {
            name: req.body?.name?.trim(),
            teamName: req.body?.teamName,
            title: req.body?.title?.trim(),
            projectLink: req.body?.projectLink?.trim(),
            description: req.body?.description,
          };
          if (req.file) {
            patch.screenshotUrl = `/uploads/${
              req.file.filename ||
              req.file.path?.split("\\").pop() ||
              req.file.path?.split("/").pop()
            }`;
          }
          const updated = await Contestant.findByIdAndUpdate(
            existing._id,
            patch,
            { new: true }
          );
          return res.status(200).json({ id: updated._id, updated: true });
        }
      } catch {}
      return res.status(409).json({
        error: "Email already registered",
        email: (req.user?.email || req.body?.email || "").trim().toLowerCase(),
      });
    }
    console.error("Registration error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function list(req, res) {
  const list = await Contestant.find({}).sort({ createdAt: -1 }).lean();
  return res.json(list);
}

export async function stats(req, res) {
  const registrations = await Contestant.countDocuments();
  const top = await Contestant.findOne({}).sort({ score: -1 }).select("score");
  return res.json({ registrations, topScore: top?.score || 0 });
}

export async function updateScore(req, res) {
  const { id } = req.params;
  const { score } = req.body;
  const updated = await Contestant.findByIdAndUpdate(
    id,
    { score },
    { new: true }
  );
  return res.json(updated);
}

export async function remove(req, res) {
  const { id } = req.params;
  await Contestant.findByIdAndDelete(id);
  return res.json({ ok: true });
}

export async function exportCSV(req, res) {
  const list = await Contestant.find({}).sort({ createdAt: -1 }).lean();
  const cols = [
    "name",
    "email",
    "teamName",
    "title",
    "projectLink",
    "description",
    "score",
    "createdAt",
  ];
  const header = cols.join(",");
  const rows = list.map((c) =>
    cols
      .map((k) => {
        const v = c[k] ?? "";
        const s = String(v).replaceAll('"', '""');
        return `"${s}"`;
      })
      .join(",")
  );
  const csv = [header, ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="contestants.csv"'
  );
  return res.send(csv);
}
