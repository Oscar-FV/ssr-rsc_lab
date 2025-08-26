"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { getPokemonByName } from "@/lib/pokeapi";
import { useQuery } from "@tanstack/react-query";

// Remove TypeScript interfaces for JSX compatibility

// Convert typeColors to plain JS object
const typeColors = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-blue-200",
  fighting: "bg-red-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-600",
  flying: "bg-indigo-400",
  psychic: "bg-pink-500",
  bug: "bg-green-400",
  rock: "bg-yellow-800",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-800",
  steel: "bg-gray-500",
  fairy: "bg-pink-300",
};

// Use plain JS object for statNames
const statNames = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defensa",
  "special-attack": "At. Esp.",
  "special-defense": "Def. Esp.",
  speed: "Velocidad",
};

export function PokemonDisplay({ pokemonName }) {
  const {
    data: pokemon,
    isPending,
    error,
  } = useQuery({
    queryKey: ["pokemon", pokemonName],
    queryFn: () => getPokemonByName(pokemonName),
  });

  if (isPending) return <p>Cargando…</p>;
  if (error) return <p>Ocurrió un error.</p>;

  const capitalizedName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const maxStat = Math.max(...pokemon.stats.map((stat) => stat.base));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
          <Image
            src={pokemon.sprites.official || pokemon.sprites.front_default}
            alt={capitalizedName}
            width={300}
            height={300}
            className="relative z-10 mx-auto"
          />
        </div>
        <h1 className="text-4xl font-bold text-foreground mt-4 mb-2">
          {capitalizedName}
        </h1>
        <p className="text-muted-foreground text-lg">
          #{pokemon.id.toString().padStart(3, "0")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Altura:</span>
              <span className="font-semibold">{pokemon.height / 10} m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso:</span>
              <span className="font-semibold">{pokemon.weight / 10} kg</span>
            </div>
          </CardContent>
        </Card>

        {/* Types Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Tipos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pokemon.types.map((type) => (
                <Badge
                  key={type}
                  className={`${
                    typeColors[type] || "bg-gray-400"
                  } text-white font-semibold px-3 py-1`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Abilities Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Habilidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pokemon.abilities.map((ability) => (
                <div
                  key={ability}
                  className="bg-muted px-3 py-2 rounded-md text-sm font-medium"
                >
                  {ability
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card - spans full width */}
        <Card className="bg-card border-border md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Estadísticas Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      {statNames[stat.name] || stat.name}
                    </span>
                    <span className="text-sm font-bold">{stat.base}</span>
                  </div>
                  <Progress
                    value={(stat.base / maxStat) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">
                  {pokemon.stats.reduce((sum, stat) => sum + stat.base, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
