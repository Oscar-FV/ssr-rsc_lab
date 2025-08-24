"use client";

import Link from "next/link";

export const columns = [
  {
    accessorKey: "id",
    header: () => <span>#</span>,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.getValue("id")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: () => <span>Nombre</span>,
    cell: ({ row }) => (
      <span className="capitalize font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    id: "sprite",
    header: () => <span>Sprite</span>,
    cell: ({ row }) => (
      <img
        src={row.original.sprite}
        alt={row.original.name}
        className="h-10 w-10 object-contain"
      />
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: "actions",
    header: () => <span>Acciones</span>,
    cell: ({ row }) => (
      <Link
        href={`/pokemon/${row.original.name}`}
        className="text-primary underline underline-offset-4"
      >
        Ver detalle
      </Link>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  },
];
