import React from "react";
import PokemonTable from "./components/pokemon-table";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getPokemonList } from "@/lib/pokeapi";

export const revalidate = 60;

export default async function PokemonPage({ searchParams }) {
  const page = Number(searchParams?.page ?? 1) || 1;
  const pageSize = 50;

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ["pokemonList", page, pageSize],
    queryFn: () => getPokemonList(page, pageSize),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Pokédex (SSR + hydratation)</h1>
      <HydrationBoundary state={dehydrate(qc)}>
        <PokemonTable page={page} pageSize={pageSize} />
      </HydrationBoundary>
    </div>
  );
}
