import type { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  PokemonListResponse, 
  PokemonDetail, 
  SearchParams 
} from '../types';
import { mockUser, mockPokemonList, mockPokemonDetails, generateMoreMockPokemon } from './mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock authentication state
let isAuthenticated = false;

// Mock API responses
export class MockApiService {
  
  // Auth endpoints
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(800);
    
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      isAuthenticated = true;
      return { user: mockUser };
    }
    
    throw new Error('Invalid credentials');
  }

  static async logout(): Promise<void> {
    await delay(300);
    isAuthenticated = false;
  }

  static async getCurrentUser(): Promise<User> {
    await delay(200);
    
    if (!isAuthenticated) {
      throw new Error('Unauthenticated');
    }
    
    return mockUser;
  }

  // Pokemon endpoints
  static async searchPokemon(params: SearchParams = {}): Promise<PokemonListResponse> {
    await delay(600);
    
    if (!isAuthenticated) {
      throw new Error('Unauthenticated');
    }

    const { name = '', page = 1, pageSize = 20 } = params;
    const allPokemon = generateMoreMockPokemon(100);
    
    // Filter by name if provided
    let filteredPokemon = allPokemon;
    if (name) {
      filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // Paginate results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredPokemon.slice(startIndex, endIndex);

    return {
      items,
      page,
      pageSize,
      total: filteredPokemon.length
    };
  }

  static async getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
    await delay(400);
    
    if (!isAuthenticated) {
      throw new Error('Unauthenticated');
    }

    const pokemonName = typeof nameOrId === 'number' 
      ? mockPokemonList.find(p => p.id === nameOrId)?.name 
      : nameOrId;

    if (!pokemonName || !mockPokemonDetails[pokemonName]) {
      throw new Error('Pokemon not found');
    }

    return mockPokemonDetails[pokemonName];
  }

  // CSRF endpoint (mock)
  static async getCsrfCookie(): Promise<void> {
    await delay(100);
    // In real implementation, this would set the CSRF cookie
  }
}
