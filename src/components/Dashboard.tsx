// import Image from "next/image";
// import Link from "next/link";
// import Breadcrumb from "./Breadcrumb";
import { Link } from "@tanstack/react-router";
import SearchBar from "./SearchBar";

import ImgPlakup from "~/assets/plakup.png";

export default function Dashboard({ children }: React.PropsWithChildren) {
  return (
    <>
      <header className="bg-blue-400 p-4">
        <Link
          to="/"
          className="flex items-center justify-center text-4xl font-semibold text-white sm:justify-normal"
        >
          <img src={ImgPlakup} alt="Plakar" width="100" height="100" />
          <div>
            Plakar<span className="text-gray-700">.io</span>
          </div>
        </Link>
      </header>
      <main className="container mx-auto flex flex-col gap-5 overflow-auto pb-16 pt-5">
        <SearchBar />
        {children}
      </main>
    </>
  );
}
