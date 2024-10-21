import Dashboard from "~/components/Dashboard";
import prettyBytes from "pretty-bytes";
import type { Directory } from "~/api/types/browse";
import { DateForDisplay, ModeForDisplay } from "~/utils/display";
import { GoFile, GoFileDirectoryFill, GoLink, GoSearch } from "react-icons/go";
import { browseSnapshot } from "~/api/snapshots";
import { useCallback, useRef } from "react";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

type FilePreviewProps = {
  file: TreeEntryType | undefined;
};

function FilePreview({ file }: FilePreviewProps) {
  if (!file) {
    return (
      <p className="text-center text-sm">
        To preview a file, select it in the list on the left and press the
        space, or click on the details button.
      </p>
    );
  }
  return (
    <div className="h-full">
      <h1 className="text-xl font-bold">{file.info.Name}</h1>
      <iframe
        className="h-full w-full"
        src={`http://localhost:30112/raw/${file.snapshotId}:${file.rootdir}${file.info.Name}`}
      ></iframe>
    </div>
  );
}

type TreeEntryType = {
  snapshotId: string;
  rootdir: string;
  type: "directory" | "file" | "symlink";
  info: Directory;
};

type SnapshotBrowserProps = {
  snapshotId: string;
  path: string;
  setPath: (value: string) => void;
};

function SnapshotBrowser({ snapshotId, path, setPath }: SnapshotBrowserProps) {
  const [selected, setSelected] = useState<TreeEntryType | null>(null);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { data } = useQuery({
    queryKey: ["snapshots", snapshotId, path],
    queryFn: async () => {
      const apiResponse = await browseSnapshot(snapshotId, path);

      const tree: TreeEntryType[] = [
        ...apiResponse.Directories.map((entry) => ({
          snapshotId,
          rootdir: path,
          type: "directory" as TreeEntryType["type"],
          info: entry,
        })),
        ...apiResponse.Files.map((entry) => ({
          snapshotId,
          rootdir: path,
          type: "file" as TreeEntryType["type"],
          info: entry,
        })),
        ...apiResponse.Symlinks.map((entry) => ({
          snapshotId,
          rootdir: path,
          type: "symlink" as TreeEntryType["type"],
          info: entry,
        })),
      ].sort((a, b) => a.info.Name.localeCompare(b.info.Name));
      return tree;
    },
  });

  const getSelectedIndex = () => {
    const ret = rowRefs.current.findIndex(
      (ref) => ref === document.activeElement,
    );
    return ret;
  };

  // Hook to change the current selection.
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
            rowRefs.current[data.length - 1]?.focus();
          } else {
            rowRefs.current[selectedIndex - 1]?.focus();
          }
          break;
        case "ArrowDown":
          if (selectedIndex === -1 || selectedIndex === data.length - 1) {
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
  }, [data, path, setPath]);

  // Hook to enter in a directory
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!data) {
        return;
      }
      const selectedIndex = getSelectedIndex();
      if (selectedIndex === -1) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "Enter":
          const selected = data[selectedIndex];
          if (selected && selected.type === "directory") {
            setPath(`${path}${selected.info.Name}/`);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [data, path, setPath]);

  // Hook to exit from a directory
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
        case "Escape":
          const newpath = path.split("/").slice(0, -2).join("/") + "/";
          setPath(newpath);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [path, setPath]);

  // Enable/Disable preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          setShowPreview((prev) => !prev);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [path, setPath]);

  useEffect(() => {
    const selectedIndex = getSelectedIndex();
    if (selectedIndex === -1) {
      setSelected(null);
    } else {
      const item = data?.[selectedIndex];
      if (item) {
        setSelected(item);
      }
    }
  }, [data]);

  useEffect(() => {
    const handleFocusChange = () => {
      const selectedIndex = getSelectedIndex();
      if (selectedIndex === -1) {
        setSelected(null);
      } else {
        const item = data?.[selectedIndex];
        if (item && item.type === "file") {
          setSelected(item);
        } else {
          setSelected(null);
        }
      }
    };

    window.addEventListener("focusin", handleFocusChange);
    return () => {
      window.removeEventListener("focusin", handleFocusChange);
    };
  }, [data]);

  if (!data) {
    return <div>Loading…</div>;
  }

  return (
    <div className="flex min-h-[50vh] flex-wrap gap-2">
      <table className="h-full w-full flex-1 border-separate border-spacing-0 rounded-md border-t-4 border-gray-700 text-left text-sm text-gray-600">
        <thead className="bg-gray-700 text-xs uppercase text-white">
          <tr>
            <th className="px-2 py-2">Name</th>
            <th className="py-2">Size</th>
            <th className="py-2">Modification time</th>
            <th className="py-2">Mode</th>
            <th className="px-2 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, idx) => (
            <tr
              tabIndex={0}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              key={entry.info.Name}
              className="cursor-pointer odd:bg-white even:bg-blue-50 focus:bg-slate-600 focus:text-white"
              onClick={() => setPath(`${path}${entry.info.Name}/`)}
            >
              <td className="flex gap-1 px-2 py-2 align-middle">
                {
                  {
                    directory: <GoFileDirectoryFill />,
                    file: <GoFile />,
                    symlink: <GoLink />,
                  }[entry.type]
                }
                {entry.info.Name}
              </td>
              <td className="py-2">{prettyBytes(entry.info.Size)}</td>
              <td className="py-2">
                {DateForDisplay(new Date(entry.info.ModTime))}
              </td>
              <td className="py-2">{ModeForDisplay(entry.info.Mode)}</td>
              <td className="px-2 py-2 hover:scale-125">
                {entry.type === "file" && (
                  <GoSearch
                    onClick={(e) => {
                      setShowPreview(true);
                      e.stopPropagation();
                    }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPreview && (
        <div className="flex-1">{<FilePreview file={selected} />}</div>
      )}
    </div>
  );
}

export default function SnapshotBrowsePage() {
  const router = useRouter();
  const snapshotId = router.query.id as string;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setPath = useCallback(
    async (value: string) => {
      // Return to the root path if the user tries to go up from the root.
      const urlValue = searchParams.get("path");
      if (value == "/" && (urlValue == value || urlValue == null)) {
        await router.push(`/`);
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("path", value);
      await router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const path = searchParams.get("path") ?? "/";

  if (!snapshotId) {
    return <div>Loading…</div>;
  }
  return (
    <Dashboard>
      <SnapshotBrowser snapshotId={snapshotId} path={path} setPath={setPath} />
    </Dashboard>
  );
}
