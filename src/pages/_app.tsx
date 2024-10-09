import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import Head from "next/head";

import "~/styles/globals.css";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Plakar</title>
        <meta
          name="description"
          content="plakar is a free and opensource utility to create distributed, versionned backups with compression, encryption and data deduplication."
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className={GeistSans.className}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </div>
    </>
  );
};

export default MyApp;
