import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";

import { api } from "~/utils/api";

import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { CreatePostWizard } from "~/components/create-post-wizard";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex border-b border-slate-400 p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {!!isSignedIn && <CreatePostWizard />}
      </div>
      <Feed />
    </PageLayout>
  );
};

export default Home;
