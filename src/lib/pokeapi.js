// src/lib/pokeapi.js

const BASE = "https://pokeapi.co/api/v2";

/**
 * Util: extrae el id numérico desde la URL de PokeAPI
 * ej: https://pokeapi.co/api/v2/pokemon/25/ -> 25
 */
export function getIdFromUrl(url) {
  const match = url.match(/\/pokemon\/(\d+)\/*$/);
  return match ? Number(match[1]) : null;
}

/**
 * Util: arma un sprite PNG estático (Dream World/SVG requiere otro endpoint)
 * Puedes cambiar a official-artwork si prefieres mayor calidad:
 * https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{id}.png
 */
export function getSpriteUrlById(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

/**
 * Fetch de lista con paginación.
 * - Corre perfecto en RSC/SSR. El `next.revalidate` activa ISR para caché en Next.
 * - Devuelve un shape cómodo para tablas/paginación.
 *
 * @param {number} page - 1-based page
 * @param {number} pageSize - items por página
 * @param {object} opts - { revalidate?: number } segundos para ISR
 */
export async function getPokemonList(page = 1, pageSize = 50, opts = {}) {
  const offset = (page - 1) * pageSize;
  const url = `${BASE}/pokemon?limit=${pageSize}&offset=${offset}`;

  const res = await fetch(url, {
    // Nota: este objeto `next` solo tiene efecto en el servidor (RSC/SSR).
    next: { revalidate: opts.revalidate ?? 60 },
  });

  if (!res.ok) {
    const msg = `Error al obtener la lista de Pokémon (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json(); // { count, next, previous, results: [{ name, url }] }

  // Enriquecemos con id y sprite ya listos para la tabla
  const results = (data.results || []).map((p, i) => {
    const id = getIdFromUrl(p.url) ?? (offset + i + 1);
    return {
      id,
      name: p.name,
      url: p.url,
      sprite: getSpriteUrlById(id),
    };
  });

  return {
    count: data.count,
    page,
    pageSize,
    results,
    hasNext: Boolean(data.next),
    hasPrev: Boolean(data.previous),
  };
}

/**
 * Detalle por nombre o id.
 * - Puedes usarlo en /pokemon/[name] con prefetch SSR + Hydration.
 *
 * @param {string|number} nameOrId
 * @param {object} opts - { revalidate?: number }
 */
export async function getPokemonByName(nameOrId, opts = {}) {
  const url = `${BASE}/pokemon/${nameOrId}`;
  const res = await fetch(url, {
    next: { revalidate: opts.revalidate ?? 60 },
  });

  if (!res.ok) {
    const msg = `No se pudo obtener el Pokémon "${nameOrId}" (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json();

  // Normalización mínima útil para tu UI
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types?.map((t) => t.type?.name) || [],
    abilities: data.abilities?.map((a) => a.ability?.name) || [],
    stats: (data.stats || []).map((s) => ({
      name: s.stat?.name,
      base: s.base_stat,
    })),
    sprites: {
      front_default: data.sprites?.front_default || getSpriteUrlById(data.id),
      official:
        data.sprites?.other?.["official-artwork"]?.front_default ||
        null,
    },
    raw: data, // por si necesitas todo el objeto original
  };
}
