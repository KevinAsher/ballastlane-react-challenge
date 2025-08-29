// PokeAPI structure for types
export interface PokemonTypeSlot {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonSprite {
  front_default: string | null;
  back_default: string | null;
  front_female?: string | null;
  back_female?: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  front_shiny_female?: string | null;
  back_shiny_female?: string | null;
  other?: {
    dream_world?: {
      front_default: string | null;
      front_female?: string | null;
    };
    home?: {
      front_default: string | null;
      front_female?: string | null;
      front_shiny: string | null;
      front_shiny_female?: string | null;
    };
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

// PokeAPI structure for abilities
export interface PokemonAbilitySlot {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
    effect_entries?: Array<{
      effect: string;
      language: {
        name: string;
        url: string;
      };
    }>;
    flavor_text_entries?: Array<{
      flavor_text: string;
      language: {
        name: string;
        url: string;
      };
    }>;
  };
}

export interface PokemonAbility {
  name: string;
  url: string;
  is_hidden: boolean;
  effect?: string;
}

// PokeAPI structure for stats
export interface PokemonStatSlot {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  name: string;
  base_stat: number;
}

// PokeAPI structure for moves
export interface PokemonMoveSlot {
  move: {
    name: string;
    url: string;
  };
  version_group_details: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
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

// Detailed Pokemon for modal view (PokeAPI format)
export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  order: number;
  is_default: boolean;
  location_area_encounters: string;
  types: PokemonTypeSlot[];
  sprites: PokemonSprite;
  abilities: PokemonAbilitySlot[];
  stats: PokemonStatSlot[];
  moves: PokemonMoveSlot[];
  forms: Array<{
    name: string;
    url: string;
  }>;
  species: {
    name: string;
    url: string;
  };
  game_indices: Array<{
    game_index: number;
    version: {
      name: string;
      url: string;
    };
  }>;
  held_items: Array<{
    item: {
      name: string;
      url: string;
    };
    version_details: Array<{
      rarity: number;
      version: {
        name: string;
        url: string;
      };
    }>;
  }>;
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
