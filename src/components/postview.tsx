import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/pt-br";
import "dayjs/locale/ja";
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
import { useRouter } from "next/router";
import type { User } from "@prisma/client";

dayjs.extend(relativeTime);

const HoverProfile = (props: { author: User }) => {
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

const PostFooter = (props: {
  postId: string;
  likeCount: number;
  replyCount: number;
  likedBy: User[];
}) => {
  const { postId, likedBy, likeCount, replyCount: repliesCount } = props;
  const { isSignedIn: isUserSignedIn, user } = useUser();
  const likedByCurrentUser = likedBy.find((u) => u.id === user?.id);

  const ctx = api.useContext();

  const { mutate, isLoading: liking } = api.posts.like.useMutation({
    onSuccess: () => {
      void ctx.posts.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to like/dislike");
      }
    },
  });
  const toggleLike = () => {
    if (liking) return;
    mutate({ postId, liked: Boolean(likedByCurrentUser) });
  };

  return (
    <div className="mt-1 flex h-fit w-fit items-center justify-center gap-1 hover:cursor-pointer">
      <button
        disabled={!isUserSignedIn}
        className="group rounded-full p-1"
        onClick={() => toggleLike()}
      >
        <div
          className={`flex items-center gap-2 group-hover:text-red-700 ${
            likedByCurrentUser ? "text-red-500" : ""
          }`}
        >
          <HeartIcon
            className={
              likedByCurrentUser ? "fill-red-500 group-hover:fill-red-700" : ""
            }
          />
          <span>{likeCount}</span>
        </div>
      </button>
      <Link className="group rounded-full p-1" href={`/post/${postId}`}>
        <div className="flex items-center gap-2 group-hover:text-blue-600">
          <MessageSquareIcon className="" />
          <span>{repliesCount ?? 0}</span>
        </div>
      </Link>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const router = useRouter();
  const { locale } = router;
  const { id: postId, author, createdAt, content, _count, likedBy } = props;

  return (
    <div key={postId} className="flex gap-3 border-b p-4">
      <HoverProfile author={author} />
      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>

          <Link href={`/post/${postId}`}>
            <span className="font-thin">{` • ${dayjs(createdAt)
              .locale(locale?.toLowerCase() ?? "en")
              .fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{content}</span>
        <PostFooter
          postId={postId}
          likeCount={_count.likedBy}
          replyCount={_count.replies}
          likedBy={likedBy}
        />
      </div>
    </div>
  );
};
