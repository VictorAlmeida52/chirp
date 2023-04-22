import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { Header } from "~/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

const ProfileFeed = (props: { userId: string; tab: string }) => {
  let posts;

  if (props.tab === "posts") {
    const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
      userId: props.userId,
    });

    if (isLoading) return <LoadingPage />;

    if (!data || data.length === 0) return <div>User has not posted</div>;

    posts = data;
  } else {
    const { data, isLoading } = api.posts.getLikesByUserId.useQuery({
      userId: props.userId,
    });

    if (isLoading) return <LoadingPage />;

    if (!data || data.length === 0) return <div>User has not posted</div>;

    posts = data;
  }

  return (
    <div className="flex flex-col border">
      {posts.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`@${data.username ?? "username not found"}`}</title>
      </Head>
      <Header />
      <PageLayout>
        <div className="relative h-36 border-b border-slate-400 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${
              data.username ?? data.externalUsername ?? "unknown"
            }'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? data.externalUsername ?? "unknown"
        }`}</div>
        <div className="w-full border-t border-slate-400">
          <Tabs defaultValue="posts">
            <TabsList className="flex justify-evenly">
              <TabsTrigger className="w-full" value="posts">
                Posts
              </TabsTrigger>
              <TabsTrigger className="w-full" value="likes">
                Likes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
              <ProfileFeed userId={data.id} tab="posts" />
            </TabsContent>
            <TabsContent value="likes">
              <ProfileFeed userId={data.id} tab="likes" />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug");
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
