export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  stats: Array<{
    name: string;
    value: number;
  }>;
  sprites: {
    front_default: string | null;
  };
  species: {
    name: string;
  };
  // Add sprite field for backward compatibility
  sprite?: string | null;
}

// Alias for Pokemon to maintain compatibility
export type PokemonDetail = Pokemon;
export type PokemonListItem = Pokemon;

// Search parameters interface
export interface SearchParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

// API response interfaces
export interface PokemonListResponse {
  items: Pokemon[];
  page: number;
  pageSize: number;
  total: number;
}

// Pokemon Overview Tab Data
export interface PokemonOverview {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: string[];
}

// Pokemon Abilities Tab Data  
export type PokemonAbilities = Array<{
  name: string;
  is_hidden: boolean;
  effect?: string;
}>;

// Pokemon Moves Tab Data
export type PokemonMoves = Array<{
  name: string;
  level_learned_at: number;
  learn_method: string;
  power?: number | null;
  accuracy?: number | null;
  pp?: number | null;
  type?: string;
  damage_class?: string;
  description?: string;
}>;

// Pokemon Forms Tab Data
export type PokemonForms = Array<{
  name: string;
  is_default?: boolean;
  is_mega?: boolean;
  is_battle_only?: boolean;
  sprites?: {
    front_default?: string | null;
  };
}>;


