export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Blood Donation",
  "Food Distribution",
  "Education",
  "Health Camp",
  "Other",
];

// Returns { errors, data }. Used for both create and update.
export function validateEvent(body = {}) {
  const errors = {};
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const eventType = String(body.eventType || "").trim();
  const thumbnail = String(body.thumbnail || "").trim();
  const location = String(body.location || "").trim();
  const date = new Date(body.eventDate);

  if (title.length < 5) errors.title = "Title must be at least 5 characters";
  if (description.length < 20) errors.description = "Description must be at least 20 characters";
  if (!EVENT_TYPES.includes(eventType)) errors.eventType = "Choose a valid event type";
  if (!/^https?:\/\/.+/i.test(thumbnail)) errors.thumbnail = "Enter a valid image URL (http/https)";
  if (location.length < 3) errors.location = "Location is required";
  if (Number.isNaN(date.getTime())) errors.eventDate = "Event date is required";
  else if (date.getTime() <= Date.now()) errors.eventDate = "Event date must be in the future";

  return {
    errors,
    data: { title, description, eventType, thumbnail, location, eventDate: date },
  };
}
