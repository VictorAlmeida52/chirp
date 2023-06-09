import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/postview";
import { CreatePostWizard } from "~/components/create-post-wizard";
import { Header } from "~/components/header";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  const { data: replies } = api.posts.getAllReplies.useQuery({
    postId: id,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.content} - @${data.author.username}`}</title>
      </Head>
      <Header />
      <PageLayout>
        <PostView {...data} />
        <div className="p-8">
          <CreatePostWizard replyingTo={data.id} />
        </div>
        <div className="border-b">
          {replies?.map((reply) => (
            <div key={reply.id}>
              <PostView {...reply} />
            </div>
          ))}
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  await ssg.posts.getById.prefetch({ id });
  await ssg.posts.getAllReplies.prefetch({ postId: id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
