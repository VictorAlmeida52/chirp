import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarDays, HeartIcon, MessageSquareIcon } from "lucide-react";
import Image from "next/image";

dayjs.extend(relativeTime);

const HoverProfile = (props: {
  author: {
    username: string;
    id: string;
    profileImageUrl: string;
    createdAt: number;
  };
}) => {
  const { author } = props;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          <Image
            src={author.profileImageUrl}
            alt={`@${author.username}'s profile picture`}
            className="h-14 w-14 rounded-full"
            width={56}
            height={56}
          />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src={author.profileImageUrl} />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{`@${author.username}`}</h4>
            <p className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
              <span className="text-xs text-muted-foreground">
                {`Joined ${dayjs(author.createdAt).format("MMMM YYYY")}`}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const PostFooter = (props: { postId: string }) => {
  const { postId } = props;
  const { isSignedIn: isUserSignedIn } = useUser();

  const ctx = api.useContext();
  const { data: likeData, isLoading: isLoadingLikes } =
    api.likes.getCountByPost.useQuery({
      postId,
    });
  const { data: replies, isLoading: isLoadingReplies } =
    api.posts.getReplyCount.useQuery({
      postId,
    });
  let replyCount = 0;

  const { mutate: dislike } = api.likes.delete.useMutation({
    onSuccess: () => {
      void ctx.likes.getCountByPost.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to dislike! Please try again later.");
      }
    },
  });
  const { mutate: like } = api.likes.create.useMutation({
    onSuccess: () => {
      void ctx.likes.getCountByPost.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        dislike({ postId: postId });
      }
    },
  });

  if (!isLoadingReplies && replies && replies > 0) replyCount = replies;

  return (
    <div className="mt-1 flex h-fit w-fit items-center justify-center gap-1 hover:cursor-pointer">
      <button
        disabled={!isUserSignedIn}
        className="group rounded-full p-1"
        onClick={() => like({ postId })}
      >
        <div
          className={`flex items-center gap-2 group-hover:text-red-700 ${
            likeData?.likedByUser ? "text-red-500" : ""
          }`}
        >
          <HeartIcon
            className={
              likeData?.likedByUser
                ? "fill-red-500 group-hover:fill-red-700"
                : ""
            }
          />
          <span>{likeData ? likeData.count : 0}</span>
        </div>
      </button>
      <Link className="group rounded-full p-1" href={`/post/${postId}`}>
        <div className="flex items-center gap-2 group-hover:text-blue-600">
          <MessageSquareIcon className="" />
          <span>{replyCount}</span>
        </div>
      </Link>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b p-4">
      <HoverProfile author={author} />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>

          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` • ${dayjs(
              post.createdAt
            ).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
        <PostFooter postId={post.id} />
      </div>
    </div>
  );
};
