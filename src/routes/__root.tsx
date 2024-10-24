import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { Breadcrumbs } from "~/components/Breadcrumbs";
import Dashboard from "~/components/Dashboard";
import SearchBar from "~/components/SearchBar";
const activeProps = {
  style: {
    fontWeight: "bold",
  },
};
export const Route = createRootRoute({
  component: App,
  loader: async () => ({
    crumb: "Homepage",
  }),
});

function App() {
  return (
    <>
      <Dashboard>
        <ul>
          <li>
            <Link to="/" activeProps={activeProps}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/pokemon" activeProps={activeProps}>
              Pokemons
            </Link>
          </li>
        </ul>
        <Breadcrumbs />
        <SearchBar />
        <Outlet />
      </Dashboard>
    </>
  );
}
