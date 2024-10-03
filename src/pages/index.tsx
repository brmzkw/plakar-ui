import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { listSnapshots } from "~/api/snapshots";
import SnapshotsList from "~/components/snapshots/list";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["snapshots"],
    queryFn: listSnapshots,
  });

  return (
    <>
      <Head>
        <title>Plakar</title>
        <meta
          name="description"
          content="plakar is a free and opensource utility to create distributed, versionned backups with compression, encryption and data deduplication."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <SnapshotsList snapshots={data} />
      </main>
    </>
  );
}
