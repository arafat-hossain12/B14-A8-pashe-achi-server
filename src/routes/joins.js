import { Router } from "express";
import { ObjectId } from "mongodb";
import { events, joins } from "../db.js";
import { verifyJWT } from "../middleware/auth.js";

const router = Router();
const validId = (id) => ObjectId.isValid(id) && String(new ObjectId(id)) === id;

// POST /api/events/:id/join  (protected)
router.post("/events/:id/join", verifyJWT, async (req, res) => {
  if (!validId(req.params.id)) return res.status(404).json({ message: "Event not found" });
  const eventId = new ObjectId(req.params.id);
  const event = await events().findOne({ _id: eventId });
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (new Date(event.eventDate) < new Date())
    return res.status(400).json({ message: "This event has already taken place" });

  try {
    await joins().insertOne({
      eventId,
      userEmail: req.user.email,
      userName: req.user.name || "",
      userPhoto: req.user.photo || "",
      event: {
        title: event.title,
        thumbnail: event.thumbnail,
        location: event.location,
        eventType: event.eventType,
        eventDate: event.eventDate,
      },
      joinedAt: new Date(),
    });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: "You have already joined this event" });
    throw e;
  }
  await events().updateOne({ _id: eventId }, { $inc: { joinCount: 1 } });
  res.status(201).json({ message: "Joined successfully" });
});

// GET /api/events/:id/joined  (protected) -> has current user joined?
router.get("/events/:id/joined", verifyJWT, async (req, res) => {
  if (!validId(req.params.id)) return res.json({ joined: false });
  const found = await joins().findOne({ eventId: new ObjectId(req.params.id), userEmail: req.user.email });
  res.json({ joined: Boolean(found) });
});

// GET /api/joined  (protected) -> my joined events, sorted by event date
router.get("/joined", verifyJWT, async (req, res) => {
  const list = await joins().find({ userEmail: req.user.email }).sort({ "event.eventDate": 1 }).toArray();
  res.json(list);
});

export default router;
