import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { LoadingSpinner } from "~/components/loading";
import Image from "next/image";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export const CreatePostWizard = (props: { replyingTo?: string }) => {
  const { user } = useUser();
  const { replyingTo } = props;

  const { t } = useTranslation("common");

  const label = t("postWizard");

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
      void ctx.posts.getAllReplies.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full items-center gap-3 border-b border-slate-400 p-4">
      <Image
        src={user.profileImageUrl}
        alt={`@${user.username ?? "username not found"}'s profile picture`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder={label}
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <Button
          onClick={() =>
            mutate({ content: input, replyingTo: replyingTo ?? replyingTo })
          }
          className="hover:text- bg-transparent text-slate-200 hover:bg-blue-500 hover:text-blue-950"
        >
          Post
        </Button>
      )}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};
