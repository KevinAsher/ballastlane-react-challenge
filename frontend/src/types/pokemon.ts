export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonSprite {
  front_default: string | null;
  back_default?: string | null;
  front_shiny?: string | null;
  back_shiny?: string | null;
  official_artwork?: {
    front_default: string | null;
  };
}

export interface PokemonAbility {
  name: string;
  url: string;
  is_hidden: boolean;
  effect?: string;
}

export interface PokemonStat {
  name: string;
  base_stat: number;
}

export interface PokemonMove {
  name: string;
  url: string;
  learn_method: string;
  level_learned_at?: number;
}

export interface PokemonForm {
  name: string;
  url: string;
}

// Simplified Pokemon for list view
export interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  sprite: string | null;
}

// Detailed Pokemon for modal view
export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonType[];
  sprites: PokemonSprite;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  forms: PokemonForm[];
}

// API Response types
export interface PokemonListResponse {
  items: PokemonListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface SearchParams {
  name?: string;
  page?: number;
  pageSize?: number;
}
