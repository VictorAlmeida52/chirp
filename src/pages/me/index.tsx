import type { NextPage } from "next";
import Head from "next/head";
import { Header } from "~/components/header";
import { UserProfile, useUser } from "@clerk/nextjs";
import { type Theme } from "@clerk/types";
import { dark } from "@clerk/themes";
import { LoadingPage } from "~/components/loading";
import { useRouter } from "next/router";

const MePage: NextPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) return <LoadingPage />;

  if (isSignedIn) {
    const theme: Theme = {
      baseTheme: dark,
    };

    return (
      <>
        <Head>
          <title>{`@${user.username ?? "unknown"}`}</title>
        </Head>
        <Header />
        <div className="flex justify-center p-4">
          <UserProfile appearance={theme} />
        </div>
      </>
    );
  }

  void router.push("/");
  return null;
};

export default MePage;
