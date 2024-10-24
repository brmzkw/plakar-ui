import { createFileRoute } from "@tanstack/react-router";
import { getPokemon } from "~/api/pokemon";

export const Route = createFileRoute("/pokemon/$id")({
  loader: async ({ params }) => {
    return await getPokemon(params.id);
  },

  component: Pokemon,
});

function Pokemon() {
  const params = Route.useParams();
  const data = Route.useLoaderData();

  return (
    <div>
      Hello /pokemon/{params.id}! You are {data.name} :)
    </div>
  );
}
