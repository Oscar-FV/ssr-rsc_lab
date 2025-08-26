import React from "react";
import { PokemonDisplay } from "./components/pokemon-display";
import { getPokemonByName } from "@/lib/pokeapi";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export const revalidate = 60;

// Generate dynami metadata
export async function generateMetadata({ params }) {
  const { name } = await params;
  
  try {
    const pokemon = await getPokemonByName(name);
    
    if (!pokemon) {
      return {
        title: `Pokemon ${name} - No encontrado`,
        description: `El Pokemon ${name} no fue encontrado en la Pokedex.`,
      };
    }
    
    const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const types = pokemon.types?.join() || 'Desconocido';
    const height = pokemon.height ? (pokemon.height / 10) : 'Desconocido';
    const weight = pokemon.weight ? (pokemon.weight / 10) : 'Desconocido';
    
    return {
      title: `${pokemonName} - Pokedex`,
      description: `Descubre toda la información sobre ${pokemonName}. Tipo: ${types}. Altura: ${height}m, Peso: ${weight}kg.`,
      keywords: [
        pokemonName.toLowerCase(),
        'pokemon',
        'pokedex',
        'stats',
        'información',
        ...pokemon.types?.join() || []
      ],
      openGraph: {
        title: `${pokemonName} - Pokemon`,
        description: `Información completa sobre ${pokemonName}`,
        images: pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default
          ? [{
              url: pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default,
              width: 512,
              height: 512,
              alt: `Imagen de ${pokemonName}`,
            }]
          : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${pokemonName} - Pokemon`,
        description: `Descubre información sobre ${pokemonName}`,
        images: pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || undefined,
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Fallback metadata en caso de error
    const pokemonName = name.charAt(0).toUpperCase() + name.slice(1);
    return {
      title: `${pokemonName} - Pokemon`,
      description: `Información sobre el Pokemon ${pokemonName}.`,
      keywords: [pokemonName.toLowerCase(), 'pokemon', 'pokedex'],
    };
  }
}

export default async function PokemonInfo({ params }) {
  const { name } = await params;
  const qc = new QueryClient();
  
  await qc.prefetchQuery({
    queryKey: ["pokemon", name],
    queryFn: () => getPokemonByName(name),
  });
  
  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PokemonDisplay pokemonName={name} />
    </HydrationBoundary>
  );
}