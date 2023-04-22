import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/postview";
import { CreatePostWizard } from "~/components/create-post-wizard";
import { Header } from "~/components/header";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "react-i18next";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { t } = useTranslation("common");
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
          <CreatePostWizard label={t("postWizard")} replyingTo={data.id} />
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
  const locale = context.locale ?? "en";
  const ssg = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id");

  await ssg.posts.getById.prefetch({ id });
  await ssg.posts.getAllReplies.prefetch({ postId: id });

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
