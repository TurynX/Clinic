import { FastifyReply } from "fastify";

export async function generateAccessToken(reply: FastifyReply, user: any) {
  return reply.jwtSign(
    { role: user.role },
    {
      sub: user.id,
      expiresIn: "15m",
    },
  );
}
