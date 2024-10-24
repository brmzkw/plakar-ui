import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import Dashboard from "~/components/Dashboard";
const activeProps = {
  style: {
    fontWeight: "bold",
  },
};
export const Route = createRootRoute({
  component: App,
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
        <Outlet />
      </Dashboard>
    </>
  );
}
