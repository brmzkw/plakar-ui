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
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";

export default function SnapshotsListPage({}) {
  const [selected, setSelected] = useState<number | undefined>();
  const { data } = useQuery({
    queryKey: ["snapshots"],
    queryFn: listSnapshots,
  });
  const router = useRouter();
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  useEffect(() => {
    // Reset the selection on path change.
    setSelected(undefined);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!data) {
        return;
      }

      switch (event.key) {
        case "ArrowUp":
          setSelected((prev) => {
            switch (prev) {
              case undefined:
                return 0;
              case 0:
                return data.Headers.length - 1;
              default:
                return prev - 1;
            }
          });
          break;
        case "ArrowDown":
          setSelected((prev) => {
            switch (prev) {
              case undefined:
                return 0;
              case data.Headers.length - 1:
                return 0;
              default:
                return prev + 1;
            }
          });
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data, setSelected]);

  // Hook to enter in a snapshot
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!data || selected === undefined) {
        return;
      }
      switch (event.key) {
        case "ArrowRight":
        case "Enter":
          const snapshot = data.Headers[selected];
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
  }, [selected, data, router]);

  // Scroll to the selected row
  useEffect(() => {
    if (selected !== undefined && rowRefs.current[selected]) {
      const element = rowRefs.current[selected];
      const rect = element.getBoundingClientRect();

      // Check if the element is within the visible part of the page, to avoid scrolling if it's already visible.
      const isVisible =
        rect.top >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight);

      if (!isVisible) {
        rowRefs.current[selected]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [selected]);

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
              className={classNames("cursor-pointer", {
                "odd:bg-white even:bg-blue-50": selected !== idx,
                "bg-slate-600 text-white": selected === idx,
              })}
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
