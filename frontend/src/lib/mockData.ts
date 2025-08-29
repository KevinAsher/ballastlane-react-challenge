import type { PokemonListItem, PokemonDetail, User } from '../types';

// Mock user data
export const mockUser: User = {
  username: 'admin'
};

// Mock Pokemon data - simplified for development
export const mockPokemonList: PokemonListItem[] = [
  {
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
  },
  {
    id: 4,
    name: 'charmander',
    types: ['fire'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
  },
  {
    id: 7,
    name: 'squirtle',
    types: ['water'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
  },
  {
    id: 25,
    name: 'pikachu',
    types: ['electric'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  },
  {
    id: 6,
    name: 'charizard',
    types: ['fire', 'flying'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
  },
  {
    id: 9,
    name: 'blastoise',
    types: ['water'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png'
  },
  {
    id: 3,
    name: 'venusaur',
    types: ['grass', 'poison'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png'
  },
  {
    id: 150,
    name: 'mewtwo',
    types: ['psychic'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png'
  },
  {
    id: 151,
    name: 'mew',
    types: ['psychic'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png'
  },
  {
    id: 144,
    name: 'articuno',
    types: ['ice', 'flying'],
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png'
  }
];

// Mock Pokemon details
export const mockPokemonDetails: Record<string, PokemonDetail> = {
  'pikachu': {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    base_experience: 112,
    types: [
      { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
      back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png',
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
      official_artwork: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
      }
    },
    abilities: [
      {
        name: 'static',
        url: 'https://pokeapi.co/api/v2/ability/9/',
        is_hidden: false,
        effect: 'Contact with the Pokémon may cause paralysis.'
      },
      {
        name: 'lightning-rod',
        url: 'https://pokeapi.co/api/v2/ability/31/',
        is_hidden: true,
        effect: 'Draws in all Electric-type moves. Instead of being hit by Electric-type moves, it boosts the power of the Pokémon\'s Electric-type moves.'
      }
    ],
    stats: [
      { name: 'hp', base_stat: 35 },
      { name: 'attack', base_stat: 55 },
      { name: 'defense', base_stat: 40 },
      { name: 'special-attack', base_stat: 50 },
      { name: 'special-defense', base_stat: 50 },
      { name: 'speed', base_stat: 90 }
    ],
    moves: [
      {
        name: 'thunder-shock',
        url: 'https://pokeapi.co/api/v2/move/84/',
        learn_method: 'level-up',
        level_learned_at: 1
      },
      {
        name: 'growl',
        url: 'https://pokeapi.co/api/v2/move/45/',
        learn_method: 'level-up',
        level_learned_at: 1
      },
      {
        name: 'thunder-wave',
        url: 'https://pokeapi.co/api/v2/move/86/',
        learn_method: 'level-up',
        level_learned_at: 5
      },
      {
        name: 'thunderbolt',
        url: 'https://pokeapi.co/api/v2/move/85/',
        learn_method: 'machine'
      }
    ],
    forms: [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-form/25/' }
    ]
  },
  'charizard': {
    id: 6,
    name: 'charizard',
    height: 17,
    weight: 905,
    base_experience: 267,
    types: [
      { name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' },
      { name: 'flying', url: 'https://pokeapi.co/api/v2/type/3/' }
    ],
    sprites: {
      front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
      back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/6.png',
      front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png',
      official_artwork: {
        front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
      }
    },
    abilities: [
      {
        name: 'blaze',
        url: 'https://pokeapi.co/api/v2/ability/66/',
        is_hidden: false,
        effect: 'Powers up Fire-type moves when the Pokémon\'s HP is low.'
      },
      {
        name: 'solar-power',
        url: 'https://pokeapi.co/api/v2/ability/94/',
        is_hidden: true,
        effect: 'Boosts the Special Attack stat in harsh sunlight, but HP decreases every turn.'
      }
    ],
    stats: [
      { name: 'hp', base_stat: 78 },
      { name: 'attack', base_stat: 84 },
      { name: 'defense', base_stat: 78 },
      { name: 'special-attack', base_stat: 109 },
      { name: 'special-defense', base_stat: 85 },
      { name: 'speed', base_stat: 100 }
    ],
    moves: [
      {
        name: 'scratch',
        url: 'https://pokeapi.co/api/v2/move/10/',
        learn_method: 'level-up',
        level_learned_at: 1
      },
      {
        name: 'growl',
        url: 'https://pokeapi.co/api/v2/move/45/',
        learn_method: 'level-up',
        level_learned_at: 1
      },
      {
        name: 'ember',
        url: 'https://pokeapi.co/api/v2/move/52/',
        learn_method: 'level-up',
        level_learned_at: 7
      },
      {
        name: 'flamethrower',
        url: 'https://pokeapi.co/api/v2/move/53/',
        learn_method: 'machine'
      }
    ],
    forms: [
      { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-form/6/' }
    ]
  }
};

// Add more mock data for the list
export const generateMoreMockPokemon = (count: number = 50): PokemonListItem[] => {
  const additionalPokemon = Array.from({ length: count }, (_, i) => ({
    id: i + 11,
    name: `pokemon-${i + 11}`,
    types: ['normal'],
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i + 11}.png`
  }));
  
  return [...mockPokemonList, ...additionalPokemon];
};
