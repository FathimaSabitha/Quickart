import bcrypt from "bcrypt";
import { getDB } from "../../config/db.js";

export default async function registerRoute(fastify) {
  fastify.post("/register", async (req, reply) => {
    const db = getDB();

    const { username, password, ownerName, phone, businessName, businessCategory } = req.body;
    
    if (!username || !password || !businessName) {
      return reply.code(400).send({ message: "Missing required fields" });
    }
    const existing = await db.collection("users").findOne({ username });
  if (existing) {
    return reply.code(400).send({ message: "Username already exists" });
  }
    const passwordHash = await bcrypt.hash(password, 10);

    const shop = await db.collection("shops").insertOne({
      name: businessName,
      slug: businessName.toLowerCase().replace(/\s+/g, "-"),
      createdAt: new Date(),
    });

    const user = await db.collection("users").insertOne({
      username,
      passwordHash,
      ownerName,
      phone,
      businessCategory,
      shopId: shop.insertedId,
      createdAt: new Date(),
    });

    return { success: true };
  });

fastify.post("/login", async (req, reply) => {
  const db = getDB();
  const { username, password } = req.body;

  if (!username || !password) {
    return reply.code(400).send({ message: "Missing fields" });
  }

  const user = await db.collection("users").findOne({
    username: username.toLowerCase(),
  });

  if (!user) {
    return reply.code(401).send({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    return reply.code(401).send({ message: "Invalid credentials" });
  }

  const token = fastify.jwt.sign(
    {
      userId: user._id.toString(),
      shopId: user.shopId,
    },
    { expiresIn: "7d" }
  );

  return { token };
});

  // fastify.get("/shop/:slug", async (req, reply) => {
  //   const db = getDB();
  //   const { slug } = req.params;

  //   const shop = await db.collection("shops").findOne({ slug });

  //   if (!shop) return reply.code(404).send("Shop not found");

  //   const products = await db
  //     .collection("products")
  //     .find({ shopId: shop._id })
  //     .toArray();

  //   return { shop, products };
  // });
}
