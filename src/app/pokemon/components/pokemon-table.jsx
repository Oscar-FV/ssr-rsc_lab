"use client";

import { useQuery } from "@tanstack/react-query";
import {getPokemonList} from "../../../lib/pokeapi";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import {Button} from "@/components/ui/button"
import Link from "next/link";

export default function PokemonTable({ page, pageSize }) {
  const { data, isPending, error } = useQuery({
    queryKey: ["pokemonList", page, pageSize],
    queryFn: () => getPokemonList(page, pageSize),
  });

  if (isPending) return <p>Cargando…</p>;
  if (error) return <p>Ocurrió un error.</p>;

  const rows = data.results.map((r) => ({
    id: r.id,
    name: r.name,
    sprite: r.sprite,
  }));

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={rows} searchKey="name" />

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Página {data.page} · {rows.length} de {data.count}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" disabled={!data.hasPrev}>
            <Link href={`/pokemon?page=${Math.max(1, data.page - 1)}`}>
              ← Anterior
            </Link>
          </Button>
          <Button asChild disabled={!data.hasNext}>
            <Link href={`/pokemon?page=${data.page + 1}`}>Siguiente →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
