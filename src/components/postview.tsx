import type { RouterOutputs } from "~/utils/api";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as HoverCard from "@radix-ui/react-hover-card";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

dayjs.extend(relativeTime);

const HoverProfile = (props: { author: { username: string, id: string, profileImageUrl: string } }) => {

  const { author } = props;

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Link
          className="inline-block cursor-pointer rounded-full shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] outline-none focus:shadow-[0_0_0_2px_white]"
          href={`/@${author.username}`}
        >
          <Image
            src={author.profileImageUrl}
            alt={`@${author.username}'s profile picture`}
            className="h-14 w-14 rounded-full"
            width={56}
            height={56}
          />
        </Link>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          className="data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade w-[300px] rounded-md bg-white p-5 shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] data-[state=open]:transition-all"
          sideOffset={5}
        >
          <div className="flex flex-col gap-[7px]">
            <Image
              src={author.profileImageUrl}
              alt={`@${author.username}'s profile picture`}
              className="block h-[60px] w-[60px] rounded-full"
              width={56}
              height={56}
            />
            <div className="flex flex-col gap-[15px]">
              <div>
                <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">{ `@${author.username}` }</div>
              </div>
              <div className="text-mauve12 m-0 text-[15px] leading-[1.5]">
                Components, icons, colors, and templates for building high-quality, accessible UI.
                Free and open-source.
              </div>
              <div className="flex gap-[15px]">
                <div className="flex gap-[5px]">
                  <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">0</div>{' '}
                  <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Following</div>
                </div>
                <div className="flex gap-[5px]">
                  <div className="text-mauve12 m-0 text-[15px] font-medium leading-[1.5]">2,900</div>{' '}
                  <div className="text-mauve10 m-0 text-[15px] leading-[1.5]">Followers</div>
                </div>
              </div>
            </div>
          </div>

          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

const PostFooter = (props: { postId: string }) => {
  const { postId } = props;
  const { isSignedIn: isUserSignedIn } = useUser()

  const ctx = api.useContext();
  const { data: likes, isLoading } = api.likes.getCountByPost.useQuery({ postId })
  let likeCount = 0;

  const { mutate: dislike } = api.likes.delete.useMutation({
    onSuccess: () => {
      void ctx.likes.getCountByPost.invalidate()
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
      void ctx.likes.getCountByPost.invalidate()
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        dislike({ postId: postId })
      }
    },
  });

  if (!isLoading && likes && likes > 0) likeCount = likes

  return (
    <div className="mt-1 flex justify-center items-center gap-1 group h-fit w-fit hover:cursor-pointer">
      <button
        disabled={!isUserSignedIn}
        className="group-hover:bg-red-300 disabled:text-red-500 rounded-full p-1"
        onClick={() => like({ postId })}
      >❤</button>
      <span className="group-hover:text-red-300">
        { likeCount }
      </span>
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-t border-slate-400 p-4">
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