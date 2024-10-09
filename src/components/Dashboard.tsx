import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "./Breadcrumb";
import SearchBar from "./SearchBar";

export default function Dashboard({ children }: React.PropsWithChildren) {
  return (
    <>
      <header className="flex items-center justify-center gap-4 bg-blue-400 p-4 sm:justify-normal">
        <Image src="/plakup.png" alt="Plakar" width="100" height="100" />
        <Link href="/" className="text-4xl font-semibold text-white">
          Plakar<span className="text-gray-700">.io</span>
        </Link>
      </header>
      <main className="container mx-auto flex flex-col gap-5 overflow-auto pb-16 pt-5">
        <Breadcrumb />
        <SearchBar />
        {children}
      </main>
    </>
  );
}
