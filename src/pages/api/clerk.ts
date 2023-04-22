import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    type clerkEvent = {
      object: string;
      type: string;
      data: {
        id: string;
        username: string;
        profile_image_url: string;
        first_name: string;
        last_name: string;
      };
    };
    const { data: user, type } = req.body as clerkEvent;

    if (type === "user.created") {
      const name =
        user.username ?? `${user.first_name ?? "unknown"} ${user.last_name}`;
      try {
        const createdUser = await prisma.user.create({
          data: {
            id: user.id,
            username: name,
            profileImageUrl: user.profile_image_url,
          },
        });

        res.status(201).json(createdUser);
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          res.status(422).json({ message: "User already in db" });
        } else {
          res.status(500).json({ message: "Unknown error", error: e });
        }
      }
    } else {
      res.status(406).json({ message: "Method not implemented" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
