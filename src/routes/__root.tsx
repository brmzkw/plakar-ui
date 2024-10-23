import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div>Hello "__root"!</div>
      <Outlet />
    </>
  ),
});
