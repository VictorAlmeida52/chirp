import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 1 requests per 3 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, "3 s"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
        include: {
          author: true,
          _count: {
            select: { likedBy: true, replies: true },
          },
          likedBy: {
            where: {
              id: ctx.userId ?? "",
            },
          },
        },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return post;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      where: {
        replyingTo: "",
      },
      take: 100,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      include: {
        author: true,
        _count: {
          select: { likedBy: true, replies: true },
        },
        likedBy: {
          where: {
            id: ctx.userId ?? "",
          },
        },
      },
    });

    return posts;
  }),
  getAllReplies: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          replyingTo: input.postId,
        },
        take: 100,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        include: {
          author: true,
          _count: {
            select: { likedBy: true, replies: true },
          },
          likedBy: {
            where: {
              id: ctx.userId ?? "",
            },
          },
        },
      });

      return posts;
    }),
  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.userId,
          replyingTo: "",
        },
        take: 100,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        include: {
          author: true,
          _count: {
            select: { likedBy: true, replies: true },
          },
          likedBy: {
            where: {
              id: ctx.userId ?? "",
            },
          },
        },
      });

      return posts;
    }),
  getLikesByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          likedBy: {
            some: {
              id: input.userId,
            },
          },
        },
        take: 100,
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        include: {
          author: true,
          _count: {
            select: { likedBy: true, replies: true },
          },
          likedBy: {
            where: {
              id: ctx.userId ?? "NO_ID_FOUND",
            },
          },
        },
      });

      return posts;
    }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(255),
        replyingTo: z.string().cuid().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      return await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
          replyingTo: input.replyingTo ?? input.replyingTo,
        },
      });
    }),
  like: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        liked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { liked, postId } = input;

      const { success } = await ratelimit.limit(userId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      if (liked) {
        return await ctx.prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            likedBy: {
              disconnect: { id: userId },
            },
          },
        });
      } else {
        return await ctx.prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            likedBy: {
              connect: { id: userId },
            },
          },
        });
      }
    }),
});
