import type { AppProps, AppType } from "next/app";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { ptBR, enUS } from "@clerk/localizations";

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
  const { locale } = useRouter();
  useEffect(() => {
    window.document.documentElement.classList.add("dark");
  }, []);

  let useThisLocale;
  if (!locale) useThisLocale = enUS;
  else if (locale.toLowerCase() === "pt-br") useThisLocale = ptBR;
  else useThisLocale = enUS;

  return (
    <ClerkProvider {...pageProps} localization={useThisLocale}>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />

      <Analytics />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
