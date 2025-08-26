import React from "react";
import PokemonTable from "./components/pokemon-table";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getPokemonList } from "@/lib/pokeapi";

export const revalidate = 60;

// Función para generar metadatos dinámicos para la lista
export async function generateMetadata({ searchParams }) {
  const page = Number(searchParams?.page ?? 1) || 1;
  const pageSize = 50;
  
  try {
    // Obtener información de la lista para metadatos más precisos
    const pokemonData = await getPokemonList(page, pageSize);
    
    const startPokemon = (page - 1) * pageSize + 1;
    const endPokemon = Math.min(page * pageSize, pokemonData?.count || page * pageSize);
    const totalPokemon = pokemonData?.count || 'más de 1000';
    
    const title = page === 1 
      ? 'Pokédex - Lista Completa de Pokemon'
      : `Pokédex - Página ${page} (Pokemon ${startPokemon}-${endPokemon})`;
    
    const description = page === 1
      ? `Explora la Pokédex completa con ${totalPokemon} Pokemon. Descubre información, estadísticas y características de todos los Pokemon.`
      : `Página ${page} de la Pokédex. Pokemon ${startPokemon} al ${endPokemon} de ${totalPokemon} en total. Explora estadísticas y información detallada.`;
    
    return {
      title,
      description,
      keywords: [
        'pokedex',
        'pokemon',
        'lista pokemon',
        'pokemon completo',
        'estadísticas pokemon',
        'información pokemon',
        page > 1 ? `página ${page}` : 'primera página'
      ].filter(Boolean),
      openGraph: {
        title: title,
        description: description,
        type: 'website',
        images: [
          {
            url: '/pokemon-logo.png',
            width: 1200,
            height: 630,
            alt: 'Pokédex - Lista de Pokemon',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: ['/pokemon-logo.png'],
      },
     
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      
      ...(page > 1 && {
        alternates: {
          canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pokemon?page=${page}`,
        }
      }),
    };
  } catch (error) {
    console.error('Error generating list metadata:', error);
    
    // Fallback metadata
    return {
      title: page === 1 ? 'Pokédex - Lista de Pokemon' : `Pokédex - Página ${page}`,
      description: 'Explora la lista completa de Pokemon con información detallada y estadísticas.',
      keywords: ['pokedex', 'pokemon', 'lista pokemon'],
    };
  }
}

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