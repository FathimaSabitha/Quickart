import { ObjectId } from "mongodb";
import { getDB } from "../../config/db.js";

export default async function productRoutes(fastify) {
  const db = getDB();
  fastify.post(
    "/add",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const parts = req.parts();
      let name,
        price,
        description,
        stock,
        imageBuffer = null;

      for await (const part of parts) {
        if (part.type === "file") {
          imageBuffer = await part.toBuffer();
        } else {
          if (part.fieldname === "name") name = part.value;
          if (part.fieldname === "price") price = Number(part.value);
          if (part.fieldname === "description") description = part.value;
          if (part.fieldname === "stock") stock = Number(part.value);
        }
      }

      if (!name?.trim() || !Number.isFinite(price) || price <= 0) {
        return reply.code(400).send({
          message: "Valid name and positive price required",
        });
      }

      if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
        return reply.code(400).send({
          message: "Stock must be a non-negative integer",
        });
      }
      const shopId = new ObjectId(req.user.shopId);
      if (!shopId) {
        return reply.code(400).send({ message: "ShopId required" });
      }
      const image = imageBuffer ? imageBuffer.toString("base64") : "";

      const result = await db.collection("products").insertOne({
        name,
        price,
        description: description || "",
        image,
        stock,
        shopId,
        createdAt: new Date(),
      });

      return { success: true, productId: result.insertedId };
    },
  );

  fastify.get(
    "/header",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const shopId = new ObjectId(req.user.shopId);

      const data = await db.collection("users").find({ shopId }).toArray();
      return data;
    },
  );

  fastify.get(
    "/my-products",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const shopId = new ObjectId(req.user.shopId);

      const products = await db
        .collection("products")
        .find({ shopId })
        .toArray();

      return products;
    },
  );

  fastify.put(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params;
      const parts = req.parts();
      let name,
        price,
        stock,
        description,
        imageBuffer = null;

      for await (const part of parts) {
        if (part.type === "file") {
          imageBuffer = await part.toBuffer();
        } else {
          if (part.fieldname === "name") name = part.value;
          if (part.fieldname === "price") price = Number(part.value);
          if (part.fieldname === "description") description = part.value;
          if(part.fieldname === "stock") stock = Number(part.value)
        }
      }

      const shopId = new ObjectId(req.user.shopId);

      const updateData = {
        name,
        price,
        stock,
        description,
      };

      if (imageBuffer) {
        updateData.image = imageBuffer.toString("base64");
      }

      const result = await db.collection("products").updateOne(
        {
          _id: new ObjectId(id),
          shopId,
        },
        {
          $set: updateData,
        },
      );

      if (!result.matchedCount) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return { success: true };
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (req, reply) => {
      const { id } = req.params;

      const shopId = new ObjectId(req.user.shopId);

      const result = await db.collection("products").deleteOne({
        _id: new ObjectId(id),
        shopId,
      });
      if (!result.deletedCount) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return { success: true };
    },
  );

  fastify.get("/shop/:slug", async (req, reply) => {
    const { slug } = req.params;

    const shop = await db.collection("shops").findOne({ slug });

    if (!shop) {
      return reply.code(404).send({ message: "Shop not found" });
    }

    const products = await db
      .collection("products")
      .find({ shopId: shop._id })
      .toArray();

    return {
      shopName: shop.name,

      //or shop.businessName
      products,
    };
  });
}
