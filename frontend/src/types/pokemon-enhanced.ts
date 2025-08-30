// Mock Pokemon data based on PokeAPI structure
export interface PokemonType {
  slot: number
  type: {
    name: string
    url: string
  }
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: {
    name: string
    url: string
  }
}

export interface PokemonAbility {
  is_hidden: boolean
  slot: number
  ability: {
    name: string
    url: string
  }
}

export interface PokemonMove {
  move: {
    name: string
    url: string
  }
  version_group_details: Array<{
    level_learned_at: number
    move_learn_method: {
      name: string
      url: string
    }
    version_group: {
      name: string
      url: string
    }
  }>
}

export interface Pokemon {
  id: number
  name: string
  base_experience: number
  height: number
  weight: number
  order: number
  is_default: boolean
  abilities: PokemonAbility[]
  forms: Array<{
    name: string
    url: string
  }>
  game_indices: Array<{
    game_index: number
    version: {
      name: string
      url: string
    }
  }>
  held_items: Array<{
    item: {
      name: string
      url: string
    }
    version_details: Array<{
      rarity: number
      version: {
        name: string
        url: string
      }
    }>
  }>
  location_area_encounters: string
  moves: PokemonMove[]
  species: {
    name: string
    url: string
  }
  sprites: {
    back_default: string | null
    back_female: string | null
    back_shiny: string | null
    back_shiny_female: string | null
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
    other: {
      dream_world: {
        front_default: string | null
        front_female: string | null
      }
      home: {
        front_default: string | null
        front_female: string | null
        front_shiny: string | null
        front_shiny_female: string | null
      }
      "official-artwork": {
        front_default: string | null
        front_shiny: string | null
      }
    }
  }
  stats: PokemonStat[]
  types: PokemonType[]
  cries: {
    latest: string
    legacy: string
  }
}

// Type color mapping for visual consistency
export const typeColors: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
}

export interface PokemonSpeciesData {
  flavor_text: string
  habitat: string
  generation: string
  legendary: boolean
  mythical: boolean
  capture_rate: number
  base_happiness: number
  growth_rate: string
  egg_groups: string[]
  evolution_chain?: {
    species: string
    evolves_to?: string
    level?: number
    method?: string
  }[]
}

export interface EnhancedPokemon extends Pokemon {
  species_data: PokemonSpeciesData
  damage_relations: {
    double_damage_from: string[]
    half_damage_from: string[]
    no_damage_from: string[]
    double_damage_to: string[]
    half_damage_to: string[]
    no_damage_to: string[]
  }
  locations: string[]
  evolution_level?: number
  rarity_score: number
  competitive_tier: string
  signature_moves: string[]
  weaknesses: string[]
  resistances: string[]
  immunities: string[]
}

// Mock Pokemon data
// export const mockPokemon: EnhancedPokemon[] = [
//   {
//     id: 25,
//     name: "pikachu",
//     base_experience: 112,
//     height: 4,
//     weight: 60,
//     order: 35,
//     is_default: true,
//     abilities: [
//       {
//         is_hidden: false,
//         slot: 1,
//         ability: {
//           name: "static",
//           url: "https://pokeapi.co/api/v2/ability/9/",
//         },
//       },
//       {
//         is_hidden: true,
//         slot: 3,
//         ability: {
//           name: "lightning-rod",
//           url: "https://pokeapi.co/api/v2/ability/31/",
//         },
//       },
//     ],
//     forms: [
//       {
//         name: "pikachu",
//         url: "https://pokeapi.co/api/v2/pokemon-form/25/",
//       },
//     ],
//     game_indices: [
//       {
//         game_index: 25,
//         version: {
//           name: "red",
//           url: "https://pokeapi.co/api/v2/version/1/",
//         },
//       },
//     ],
//     held_items: [],
//     location_area_encounters: "/api/v2/pokemon/25/encounters",
//     moves: [
//       {
//         move: {
//           name: "thunder-shock",
//           url: "https://pokeapi.co/api/v2/move/84/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 1,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "thunderbolt",
//           url: "https://pokeapi.co/api/v2/move/85/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 26,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "quick-attack",
//           url: "https://pokeapi.co/api/v2/move/98/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 5,
//              move_learn_method: {
//                 name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "iron-tail",
//           url: "https://pokeapi.co/api/v2/move/231/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 42,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "gold-silver",
//               url: "https://pokeapi.co/api/v2/version-group/3/",
//             },
//           },
//         ],
//       },
//     ],
//     species: {
//       name: "pikachu",
//       url: "https://pokeapi.co/api/v2/pokemon-species/25/",
//     },
//     sprites: {
//       back_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png",
//       back_female: null,
//       back_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/25.png",
//       back_shiny_female: null,
//       front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
//       front_female: null,
//       front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
//       front_shiny_female: null,
//       other: {
//         dream_world: {
//           front_default:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/25.svg",
//           front_female: null,
//         },
//         home: {
//           front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png",
//           front_female: null,
//           front_shiny:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/25.png",
//           front_shiny_female: null,
//         },
//         "official-artwork": {
//           front_default:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
//           front_shiny:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/25.png",
//         },
//       },
//     },
//     stats: [
//       {
//         base_stat: 35,
//         effort: 0,
//         stat: {
//           name: "hp",
//           url: "https://pokeapi.co/api/v2/stat/1/",
//         },
//       },
//       {
//         base_stat: 55,
//         effort: 0,
//         stat: {
//           name: "attack",
//           url: "https://pokeapi.co/api/v2/stat/2/",
//         },
//       },
//       {
//         base_stat: 40,
//         effort: 0,
//         stat: {
//           name: "defense",
//           url: "https://pokeapi.co/api/v2/stat/3/",
//         },
//       },
//       {
//         base_stat: 50,
//         effort: 0,
//         stat: {
//           name: "special-attack",
//           url: "https://pokeapi.co/api/v2/stat/4/",
//         },
//       },
//       {
//         base_stat: 50,
//         effort: 0,
//         stat: {
//           name: "special-defense",
//           url: "https://pokeapi.co/api/v2/stat/5/",
//         },
//       },
//       {
//         base_stat: 90,
//         effort: 2,
//         stat: {
//           name: "speed",
//           url: "https://pokeapi.co/api/v2/stat/6/",
//         },
//       },
//     ],
//     types: [
//       {
//         slot: 1,
//         type: {
//           name: "electric",
//           url: "https://pokeapi.co/api/v2/type/13/",
//         },
//       },
//     ],
//     cries: {
//       latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg",
//       legacy: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/25.ogg",
//     },
//     species_data: {
//       flavor_text:
//         "When Pikachu meets something new, it blasts it with a jolt of electricity. If you come across a blackened berry, it's evidence that this Pokémon mistook the intensity of its charge.",
//       habitat: "Forest",
//       generation: "Generation I",
//       legendary: false,
//       mythical: false,
//       capture_rate: 190,
//       base_happiness: 50,
//       growth_rate: "Medium Fast",
//       egg_groups: ["Field", "Fairy"],
//       evolution_chain: [
//         { species: "pichu", evolves_to: "pikachu", method: "friendship" },
//         { species: "pikachu", evolves_to: "raichu", method: "thunder-stone" },
//       ],
//     },
//     damage_relations: {
//       double_damage_from: ["ground"],
//       half_damage_from: ["flying", "steel", "electric"],
//       no_damage_from: [],
//       double_damage_to: ["flying", "water"],
//       half_damage_to: ["grass", "electric", "dragon"],
//       no_damage_to: ["ground"],
//     },
//     locations: ["Viridian Forest", "Power Plant", "Route 2"],
//     evolution_level: 0,
//     rarity_score: 85,
//     competitive_tier: "OU",
//     signature_moves: ["thunderbolt", "quick-attack"],
//     weaknesses: ["ground"],
//     resistances: ["flying", "steel", "electric"],
//     immunities: [],
//   },
//   {
//     id: 6,
//     name: "charizard",
//     base_experience: 267,
//     height: 17,
//     weight: 905,
//     order: 7,
//     is_default: true,
//     abilities: [
//       {
//         is_hidden: false,
//         slot: 1,
//         ability: {
//           name: "blaze",
//           url: "https://pokeapi.co/api/v2/ability/66/",
//         },
//       },
//       {
//         is_hidden: true,
//         slot: 3,
//         ability: {
//           name: "solar-power",
//           url: "https://pokeapi.co/api/v2/ability/94/",
//         },
//       },
//     ],
//     forms: [
//       {
//         name: "charizard",
//         url: "https://pokeapi.co/api/v2/pokemon-form/6/",
//       },
//     ],
//     game_indices: [
//       {
//         game_index: 6,
//         version: {
//           name: "red",
//           url: "https://pokeapi.co/api/v2/version/1/",
//         },
//       },
//     ],
//     held_items: [],
//     location_area_encounters: "/api/v2/pokemon/6/encounters",
//     moves: [
//       {
//         move: {
//           name: "flamethrower",
//           url: "https://pokeapi.co/api/v2/move/53/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 34,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "fire-blast",
//           url: "https://pokeapi.co/api/v2/move/126/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 46,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "dragon-claw",
//           url: "https://pokeapi.co/api/v2/move/337/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 32,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "ruby-sapphire",
//               url: "https://pokeapi.co/api/v2/version-group/5/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "air-slash",
//           url: "https://pokeapi.co/api/v2/move/403/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 28,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "diamond-pearl",
//               url: "https://pokeapi.co/api/v2/version-group/8/",
//             },
//           },
//         ],
//       },
//     ],
//     species: {
//       name: "charizard",
//       url: "https://pokeapi.co/api/v2/pokemon-species/6/",
//     },
//     sprites: {
//       back_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/6.png",
//       back_female: null,
//       back_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/6.png",
//       back_shiny_female: null,
//       front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
//       front_female: null,
//       front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
//       front_shiny_female: null,
//       other: {
//         dream_world: {
//           front_default:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/6.svg",
//           front_female: null,
//         },
//         home: {
//         front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/6.png",
//           ont_female: null,
//           front_shiny:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/6.png",
//           front_shiny_female: null,
//         },
//         "official-artwork": {
//           front_default:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
//           front_shiny:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/6.png",
//         },
//       },
//     },
//     stats: [
//       {
//         base_stat: 78,
//         effort: 0,
//         stat: {
//           name: "hp",
//           url: "https://pokeapi.co/api/v2/stat/1/",
//         },
//       },
//       {
//         base_stat: 84,
//         effort: 0,
//         stat: {
//           name: "attack",
//           url: "https://pokeapi.co/api/v2/stat/2/",
//         },
//       },
//       {
//         base_stat: 78,
//         effort: 0,
//         stat: {
//           name: "defense",
//           url: "https://pokeapi.co/api/v2/stat/3/",
//         },
//       },
//       {
//         base_stat: 109,
//         effort: 3,
//         stat: {
//           name: "special-attack",
//           url: "https://pokeapi.co/api/v2/stat/4/",
//         },
//       },
//       {
//         base_stat: 85,
//         effort: 0,
//         stat: {
//           name: "special-defense",
//           url: "https://pokeapi.co/api/v2/stat/5/",
//         },
//       },
//       {
//         base_stat: 100,
//         effort: 0,
//         stat: {
//           name: "speed",
//           url: "https://pokeapi.co/api/v2/stat/6/",
//         },
//       },
//     ],
//     types: [
//       {
//         slot: 1,
//         type: {
//           name: "fire",
//           url: "https://pokeapi.co/api/v2/type/10/",
//         },
//       },
//       {
//         slot: 2,
//         type: {
//           name: "flying",
//           url: "https://pokeapi.co/api/v2/type/3/",
//         },
//       },
//     
//     ries: {
//       latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/6.ogg",
//       legacy: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/6.ogg",
//     },
//     species_data: {
//       flavor_text:
//         "Charizard flies around the sky in search of powerful opponents. It breathes fire of such great heat that it melts anything. However, it never turns its fiery breath on any opponent weaker than itself.",
//       habitat: "Mountain",
//       generation: "Generation I",
//       legendary: false,
//       mythical: false,
//       capture_rate: 45,
//       base_happiness: 50,
//       growth_rate: "Medium Slow",
//       egg_groups: ["Monster", "Dragon"],
//       evolution_chain: [
//         { species: "charmander", evolves_to: "charmeleon", level: 16 },
//         { species: "charmeleon", evolves_to: "charizard", level: 36 },
//       ],
//     },
//     damage_relations: {
//       double_damage_from: ["rock", "electric", "water"],
//       half_damage_from: ["fire", "grass", "fighting", "bug", "steel", "fairy"],
//       no_damage_from: ["ground"],
//       double_damage_to: ["grass", "fighting", "bug", "steel"],
//       half_damage_to: ["rock", "fire", "water", "dragon"],
//       no_damage_to: [],
//     },
//     locations: ["Charicific Valley", "Mt. Silver"],
//     evolution_level: 36,
//     rarity_score: 95,
//     competitive_tier: "UU",
//     signature_moves: ["flamethrower", "dragon-claw"],
//     weaknesses: ["rock", "electric", "water"],
//     resistances: ["fire", "grass", "fighting", "bug", "steel", "fairy"],
//     immunities: ["ground"],
//   },
//   {
//     id: 9,
//     name: "blastoise",
//     base_experience: 267,
//     height: 16,
//     weight: 855,
//     order: 12,
//     is_default: true,
//     abilities: [
//       {
//         is_hidden: false,
//         slot: 1,
//         ability: {
//           name: "torrent",
//           url: "https://pokeapi.co/api/v2/ability/67/",
//         },
//       },
//       {
//         is_hidden: true,
//         slot: 3,
//         ability: {
//           name: "rain-dish",
//           url: "https://pokeapi.co/api/v2/ability/44/",
//         },
//       },
//     ],
//     forms: [
//       {
//         name: "blastoise",
//         url: "https://pokeapi.co/api/v2/pokemon-form/9/",
//       },
//     ],
//     game_indices: [
//       {
//         game_index: 9,
//         version: {
//           name: "red",
//           url: "https://pokeapi.co/api/v2/version/1/",
//         },
//       },
//     ],
//     held_items: [],
//     location_area_encounters: "/api/v2/pokemon/9/encounters",
//     moves: [
//       {
//         move: {
//           name: "water-gun",
//           url: "https://pokeapi.co/api/v2/move/55/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 1,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "hydro-pump",
//           url: "https://pokeapi.co/api/v2/move/56/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 42,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//       {
//         move: {
//           name: "ice-beam",
//           url: "https://pokeapi.co/api/v2/move/58/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 0,
//             move_learn_method: {
//               name: "machine",
//               url: "https://pokeapi.co/api/v2/move-learn-method/4/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//         },
//         ,
//       },
//       {
//         move: {
//           name: "skull-bash",
//           url: "https://pokeapi.co/api/v2/move/130/",
//         },
//         version_group_details: [
//           {
//             level_learned_at: 55,
//             move_learn_method: {
//               name: "level-up",
//               url: "https://pokeapi.co/api/v2/move-learn-method/1/",
//             },
//             version_group: {
//               name: "red-blue",
//               url: "https://pokeapi.co/api/v2/version-group/1/",
//             },
//           },
//         ],
//       },
//     ],
//     species: {
//       name: "blastoise",
//       url: "https://pokeapi.co/api/v2/pokemon-species/9/",
//     },
//     sprites: {
//       back_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/9.png",
//       back_female: null,
//       back_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/9.png",
//       back_shiny_female: null,
//       front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
//       front_female: null,
//       front_shiny: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/9.png",
//       front_shiny_female: null,
//       other: {
//         dream_world: {
//           front_default:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/9.svg",
//           front_female: null,
//         },
//         home: {
//           front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/9.png",
//           front_female: null,
//           front_shiny:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/9.png",
//           front_shiny_female: null,
//         },
//         "official-artwork": {
//           front_default:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
//           front_shiny:
//             "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/9.png",
//         },
//       },
//     },
//     stats: [
//       {
//         base_stat: 79,
//         effort: 0,
//         stat: {
//           name: "hp",
//           url: "https://pokeapi.co/api/v2/stat/1/",
//         },
//       },
//       {
//         base_stat: 83,
//         effort: 0,
//         stat: {
//           name: "attack",
//           url: "https://pokeapi.co/api/v2/stat/2/",
//         },
//       },
//       {
//         base_stat: 100,
//         effort: 0,
//         stat: {
//           name: "defense",
//           url: "https://pokeapi.co/api/v2/stat/3/",
//         },
//       },
//       {
//         base_stat: 85,
//         effort: 0,
//         stat: {
//           name: "special-attack",
//           url: "https://pokeapi.co/api/v2/stat/4/",
//         },
//       },
//       {
//         base_stat: 105,
//         effort: 3,
//         stat: {
//           name: "special-defense",
//           url: "https://pokeapi.co/api/v2/stat/5/",
//         },
//       },
//       {
//         base_stat: 78,
//         effort: 0,
//         stat: {
//           name: "speed",
//           url: "https://pokeapi.co/api/v2/stat/6/",
//         },
//       },
//     ],
//     types: [
//       {
//         slot: 1,
//         type: {
//           name: "water",
//           url: "https://pokeapi.co/api/v2/type/11/",
//         },
//       },
//     ],
//     cries: {
//       latest: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/9.ogg",
//       legacy: "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/9.ogg",
//     },
//     species_data: {
//       flavor_text:
//         "Blastoise has water spouts that protrude from its shell. The water spouts are very accurate. They can punch through thick steel with their water that comes out at high pressure.",
//       habitat: "Freshwater",
//       generation: "Generation I",
//       legendary: false,
//       mythical: false,
//       capture_rate: 45,
//       base_happiness: 50,
//       growth_rate: "Medium Slow",
//       egg_groups: ["Monster", "Water 1"],
//       evolution_chain: [
//         { species: "squirtle", evolves_to: "wartortle", level: 16 },
//         { species: "wartortle", evolves_to: "blastoise", level: 36 },
//       ],
//     },
//     damage_relations: {
//       double_damage_from: ["grass", "electric"],
//       half_damage_from: ["fire", "water", "ice", "steel"],
//       no_damage_from: [],
//       double_damage_to: ["fire", "ground", "rock"],
//       half_damage_to: ["water", "grass", "dragon"],
//       no_damage_to: [],
//     },
//     locations: ["Cerulean Cave", "Seafoam Islands"],
//     evolution_level: 36,
//     rarity_score: 95,
//     competitive_tier: "RU",
//     signature_moves: ["hydro-pump", "skull-bash"],
//     weaknesses: ["grass", "electric"],
//     resistances: ["fire", "water", "ice", "steel"],
//     immunities: [],
//   },
// ]
