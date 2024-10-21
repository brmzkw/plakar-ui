import Dashboard from "~/components/Dashboard";
import prettyBytes from "pretty-bytes";
import { useRouter } from "next/router";
import {
  DateForDisplay,
  PathForDisplay,
  UUIDForDisplay,
} from "~/utils/display";
import { GoDownload, GoFile, GoFileDirectory } from "react-icons/go";
import { listSnapshots } from "~/api/snapshots";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export default function SnapshotsListPage({}) {
  const { data } = useQuery({
    queryKey: ["snapshots"],
    queryFn: listSnapshots,
  });
  const router = useRouter();
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const getSelectedIndex = () => {
    const ret = rowRefs.current.findIndex(
      (ref) => ref === document.activeElement,
    );
    return ret;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!data) {
        return;
      }

      const selectedIndex = getSelectedIndex();

      switch (event.key) {
        case "ArrowUp":
          if (selectedIndex === -1) {
            rowRefs.current[0]?.focus();
          } else if (selectedIndex === 0) {
            rowRefs.current[data.Headers.length - 1]?.focus();
          } else {
            rowRefs.current[selectedIndex - 1]?.focus();
          }
          break;
        case "ArrowDown":
          if (
            selectedIndex === -1 ||
            selectedIndex === data.Headers.length - 1
          ) {
            rowRefs.current[0]?.focus();
          } else {
            rowRefs.current[selectedIndex + 1]?.focus();
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data]);

  // Hook to enter in a snapshot
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!data) {
        return;
      }
      switch (event.key) {
        case "ArrowRight":
        case "Enter":
          const selectedIndex = getSelectedIndex();
          if (selectedIndex === -1) {
            return;
          }
          const snapshot = data.Headers[selectedIndex];
          if (!snapshot) {
            return;
          }
          router.push(`/snapshots/${snapshot.IndexID}`).catch(console.error);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data, router]);

  if (!data) {
    return <div>Loading…</div>;
  }

  return (
    <Dashboard>
      <table className="w-full border-separate border-spacing-0 rounded-md border-t-4 border-gray-700 text-left text-sm text-gray-600">
        <thead className="bg-gray-700 text-xs uppercase text-white">
          <tr>
            <th scope="col" className="px-2 py-2">
              Date
            </th>
            <th scope="col" className="py-2">
              UUID
            </th>
            <th scope="col" className="py-2">
              Hostname
            </th>
            <th scope="col" className="py-2">
              Path
            </th>
            <th scope="col" className="px-2 py-2">
              Stats
            </th>
          </tr>
        </thead>
        <tbody>
          {data.Headers.map((snapshot, idx) => (
            <tr
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              tabIndex={0}
              className="cursor-pointer odd:bg-white even:bg-blue-50 focus:bg-slate-600 focus:text-white"
              key={snapshot.IndexID}
              onClick={() => router.push(`/snapshots/${snapshot.IndexID}`)}
            >
              <td
                className="px-2 py-2"
                title={new Date(snapshot.CreationTime).toISOString()}
              >
                {DateForDisplay(new Date(snapshot.CreationTime))}
              </td>
              <td className="py-2" title={snapshot.IndexID}>
                {UUIDForDisplay(snapshot.IndexID)}
              </td>
              <td className="py-2">
                {snapshot.Username}@{snapshot.Hostname}
              </td>
              <td className="py-2">
                {snapshot.ScannedDirectories.map((dir) => {
                  return (
                    <div key={dir}>
                      {PathForDisplay(dir, snapshot.Username)}
                    </div>
                  );
                })}
              </td>
              <td className="px-2 py-2">
                <div
                  className="flex items-center gap-1"
                  title={`${snapshot.DirectoriesCount} directories`}
                >
                  <GoFileDirectory /> {snapshot.DirectoriesCount}
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${snapshot.FilesCount} files`}
                >
                  <GoFile /> {snapshot.FilesCount}
                </div>
                <div
                  className="flex items-center gap-1"
                  title={`${snapshot.ChunksSize} bytes`}
                >
                  <GoDownload /> {prettyBytes(snapshot.ChunksSize)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Dashboard>
  );
}
