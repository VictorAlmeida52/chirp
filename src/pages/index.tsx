import { useUser } from "@clerk/nextjs";
import { type GetStaticProps, type NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { api } from "~/utils/api";

import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { CreatePostWizard } from "~/components/create-post-wizard";
import { Header } from "~/components/header";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.id} />
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
    <>
      <Header />
      <PageLayout>
        {!!isSignedIn && <CreatePostWizard />}
        <Feed />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const locale = context.locale ?? "en";
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

export default Home;
