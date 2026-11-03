import { Router } from "express";
import { ObjectId } from "mongodb";
import { events, joins } from "../db.js";
import { verifyJWT } from "../middleware/auth.js";
import { validateEvent, EVENT_TYPES } from "../validate.js";

const router = Router();

const validId = (id) => ObjectId.isValid(id) && String(new ObjectId(id)) === id;

// GET /api/event-types
router.get("/event-types", (_req, res) => res.json(EVENT_TYPES));

// GET /api/events?type=&search=&limit=  -> upcoming events only, soonest first
router.get("/events", async (req, res) => {
  try {
    const filter = { eventDate: { $gte: new Date() } };
    if (req.query.type && req.query.type !== "All") filter.eventType = String(req.query.type);
    if (req.query.search) {
      const s = String(req.query.search).slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: s, $options: "i" } },
        { location: { $regex: s, $options: "i" } },
      ];
    }
    let cursor = events().find(filter).sort({ eventDate: 1 });
    const limit = parseInt(req.query.limit, 10);
    if (limit > 0) cursor = cursor.limit(Math.min(limit, 50));
    res.json(await cursor.toArray());
  } catch (e) {
    res.status(500).json({ message: "Failed to load events" });
  }
});

// GET /api/events/:id  (public)
router.get("/events/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Event not found" });
  const event = await events().findOne({ _id: new ObjectId(req.params.id) });
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json(event);
});

// POST /api/events  (protected)
router.post("/events", verifyJWT, async (req, res) => {
  const { errors, data } = validateEvent(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: "Validation failed", errors });
  const doc = {
    ...data,
    creatorEmail: req.user.email,
    creatorName: req.user.name || "",
    joinCount: 0,
    createdAt: new Date(),
  };
  const result = await events().insertOne(doc);
  res.status(201).json({ _id: result.insertedId, ...doc });
});

// GET /api/my-events  (protected) -> events created by me
router.get("/my-events", verifyJWT, async (req, res) => {
  const list = await events().find({ creatorEmail: req.user.email }).sort({ eventDate: 1 }).toArray();
  res.json(list);
});

// PUT /api/events/:id  (protected, owner only)
router.put("/events/:id", verifyJWT, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Event not found" });
  const _id = new ObjectId(req.params.id);
  const existing = await events().findOne({ _id });
  if (!existing) return res.status(404).json({ message: "Event not found" });
  if (existing.creatorEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden: you can only update your own events" });

  const { errors, data } = validateEvent(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: "Validation failed", errors });
  await events().updateOne({ _id }, { $set: { ...data, updatedAt: new Date() } });
  res.json({ message: "Event updated" });
});

// DELETE /api/events/:id  (protected, owner only)
router.delete("/events/:id", verifyJWT, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Event not found" });
  const _id = new ObjectId(req.params.id);
  const existing = await events().findOne({ _id });
  if (!existing) return res.status(404).json({ message: "Event not found" });
  if (existing.creatorEmail !== req.user.email)
    return res.status(403).json({ message: "Forbidden: you can only delete your own events" });
  await events().deleteOne({ _id });
  await joins().deleteMany({ eventId: _id });
  res.json({ message: "Event deleted" });
});

export default router;
