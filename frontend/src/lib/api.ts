import type { 
  User, 
  LoginCredentials, 
  AuthResponse, 
  PokemonListResponse, 
  PokemonDetail, 
  SearchParams 
} from '../types';

// API Configuration
const API_BASE_URL = '/api';

// API Client class with proper error handling
export class ApiError extends Error {
  public status: number;
  public data?: any;

  constructor(
    message: string,
    status: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  // Extract CSRF token from XSRF-TOKEN cookie
  private getCSRFToken(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get CSRF token from cookie
    const csrfToken = this.getCSRFToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(csrfToken && { 'X-XSRF-TOKEN': csrfToken }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session management
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response types
      if (response.status === 204) {
        // No content responses (like logout)
        return null as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        0
      );
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // First, fetch the CSRF cookie
    await this.getCsrfCookie();
    
    const response = await this.request<{ user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return { user: response.user };
  }

  async logout(): Promise<void> {
    await this.request<void>('/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ user: User }>('/me');
    return response.user;
  }

  // Pokemon endpoints
  async searchPokemon(params: SearchParams = {}): Promise<PokemonListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.name) {
      searchParams.append('name', params.name);
    }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.pageSize) {
      searchParams.append('pageSize', params.pageSize.toString());
    }

    const query = searchParams.toString();
    const endpoint = `/pokemon${query ? `?${query}` : ''}`;
    
    return this.request<PokemonListResponse>(endpoint);
  }

  async getPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
    return this.request<PokemonDetail>(`/pokemon/${nameOrId}`);
  }

  // CSRF endpoint - fetch CSRF cookie from Laravel Sanctum
  async getCsrfCookie(): Promise<void> {
    await fetch('/sanctum/csrf-cookie', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing purposes
export { ApiClient };
