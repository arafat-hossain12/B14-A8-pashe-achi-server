// Seeds 9 sample upcoming events. Run from the server folder:
//   node --env-file=.env src/seed.js
// Optional: SEED_EMAIL / SEED_NAME to own the events with your own account.
import { MongoClient } from "mongodb";

const email = process.env.SEED_EMAIL || "ahrakib673@gmail.com";
const name = process.env.SEED_NAME || "Pashe Achi Team";
const day = 24 * 60 * 60 * 1000;
const at = (d, h = 9) => {
  const t = new Date(Date.now() + d * day);
  t.setHours(h, 0, 0, 0);
  return t;
};
const img = (seed) => `https://picsum.photos/seed/${seed}/800/500`;

const samples = [
  ["Winter Clothes Distribution", "Donation", "Mirpur 10, Dhaka", 3, "winter-clothes",
   "Bring clean, usable winter clothes and help us hand them out to families who need warmth this season. Volunteers will sort and pack on site."],
  ["Riverside Tree Plantation", "Plantation", "Hatirjheel, Dhaka", 6, "tree-plant",
   "Join us to plant 500 saplings along the lake side. Tools and saplings are provided, just bring water and a good mood."],
  ["Blood Donation Camp", "Blood Donation", "Dhanmondi 27, Dhaka", 9, "blood-camp",
   "A one-day camp with trained medical staff. Healthy adults aged 18 to 55 can donate. Every bag can save up to three lives."],
  ["Neighbourhood Clean-up Day", "Cleanup", "Uttara Sector 7, Dhaka", 12, "clean-up",
   "Gloves and bags are on us. We clean the park, the footpath and the market lane together, then share tea."],
  ["Food for the Hungry", "Food Distribution", "Kamalapur, Dhaka", 15, "food-drive",
   "Help us cook and serve 300 hot meals to street families and rickshaw pullers. Cooking starts early, serving at noon."],
  ["Free School Supplies Drive", "Education", "Mohammadpur, Dhaka", 18, "school-drive",
   "Donate notebooks, pens and school bags for children from low-income families before the new term begins."],
  ["Free Health Check-up Camp", "Health Camp", "Jatrabari, Dhaka", 22, "health-camp",
   "Free blood pressure, sugar and eye check-ups by volunteer doctors, plus basic medicine and advice for the elderly."],
  ["Blanket Drive for the Needy", "Donation", "Mohammadpur, Dhaka", 26, "blanket-drive",
   "We collect and deliver blankets to night shelters and roadside families. Help with packing and delivery is welcome."],
  ["Canal Clean-up Weekend", "Cleanup", "Gulshan Lake, Dhaka", 32, "canal-clean",
   "A two-day community effort to clear plastic and waste from the lake edge. Boots and gloves provided for all volunteers."],
];

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const col = client.db(process.env.MONGODB_DB || "pasheachi").collection("events");

let added = 0;
for (const [title, eventType, location, d, seed, description] of samples) {
  if (await col.findOne({ title, creatorEmail: email })) continue;
  await col.insertOne({
    title, description, eventType, location,
    thumbnail: img(seed),
    eventDate: at(d),
    creatorEmail: email,
    creatorName: name,
    joinCount: 0,
    createdAt: new Date(),
  });
  added++;
}
console.log(`Done. Added ${added} events for ${email}.`);
await client.close();
