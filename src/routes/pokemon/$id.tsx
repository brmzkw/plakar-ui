import { createFileRoute } from "@tanstack/react-router";
import { getPokemon } from "~/api/pokemon";

export const Route = createFileRoute("/pokemon/$id")({
  loader: async ({ params }) => {
    const pokemon = await getPokemon(params.id);
    return {
      pokemon,
      crumb: pokemon.name,
    };
  },
  component: Pokemon,
});

function Pokemon() {
  const params = Route.useParams();
  const { pokemon } = Route.useLoaderData();

  return (
    <div>
      Hello /pokemon/{params.id}! You are {pokemon.name} :)
    </div>
  );
}
