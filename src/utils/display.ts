// Translation of golang Filemod.String() in typescript.
export function ModeForDisplay(mode: number) {
  const str = "dalTLDpSugct?";
  const buf: string[] = [];
  let w = 0;

  // Process the first part of the mode string based on the initial bits (32-12).
  for (let i = 0; i < str.length; i++) {
    if (mode & (1 << (32 - 1 - i))) {
      buf[w] = str[i] ?? "";
      w++;
    }
  }

  // If no bits were set, use '-'
  if (w === 0) {
    buf[w] = "-";
    w++;
  }

  const rwx = "rwxrwxrwx";
  // Process the permission bits (9-0)
  for (let i = 0; i < rwx.length; i++) {
    if (mode & (1 << (9 - 1 - i))) {
      buf[w] = rwx[i] ?? "";
    } else {
      buf[w] = "-";
    }
    w++;
  }

  return buf.join("");
}

// Attempt to shorten the path by replacing the user's home directory with '~'.
export function PathForDisplay(path: string, username: string) {
  const tests = [
    {
      regex: new RegExp(`^/home/${username}/`),
      replace: "~/",
    },
    {
      regex: new RegExp(`^/Users/${username}/`),
      replace: "~/",
    },
  ];

  for (const r of tests) {
    if (r.regex.test(path)) {
      return path.replace(r.regex, r.replace);
    }
  }
  return path;
}

export function DateForDisplay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export function UUIDForDisplay(uuid: string) {
  return uuid.slice(0, 8);
}
