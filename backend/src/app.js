import dotenv from "dotenv";
dotenv.config();

import fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

const app = fastify();

app.register(jwt, {
  secret: process.env.JWT_SECRET,
});

app.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
});

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

app.decorate("authenticate", async function (req, reply) {
  if (req.method === "OPTIONS") return;
  try {
    await req.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: "Unauthorized" });
  }
});

export default app;
