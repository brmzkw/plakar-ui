import { validate as uuidValidate } from "uuid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Breadcrumbs = () => {
  const [urlPathname, setUrlPathname] = useState<string>();
  const router = useRouter();

  useEffect(() => {
    const url = new URL(router.asPath, window.location.origin);
    setUrlPathname(url.pathname);
  }, [router]);

  const parts = urlPathname?.split("/").filter((path) => path);

  if (!parts || parts.length === 0) {
    return (
      <nav>
        <ol className="flex">
          <li>
            <Link
              href="/"
              className="text-sm text-blue-800 hover:text-blue-400"
            >
              &gt; Snapshots
            </Link>
          </li>
        </ol>
      </nav>
    );
  }

  const capitalize = (str: string) => {
    if (uuidValidate(str)) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <nav>
      <ol className="flex">
        {parts.map((segment, idx) => {
          // Create the full path up to the current segment
          const href = "/" + parts.slice(0, idx + 1).join("/");
          // hack: /snapshots is available at /, so we need to fix the href,
          // otherwise the link is /snapshots which doesn't exist
          const hrefOk = href === "/snapshots" ? "/" : href;

          return (
            <li key={segment}>
              {idx === parts.length - 1 ? (
                // No link for the last item (current page)
                <span className="text-sm">{capitalize(segment)}</span>
              ) : (
                <>
                  <Link
                    href={hrefOk}
                    className="text-sm text-blue-800 hover:text-blue-400"
                  >
                    &gt; {capitalize(segment)}
                  </Link>
                  <span>&nbsp;&gt;&nbsp;</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
