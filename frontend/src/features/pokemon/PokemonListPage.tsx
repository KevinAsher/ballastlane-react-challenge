import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/button';
import { PokemonSearch } from './PokemonSearch';
import { PokemonCard } from './PokemonCard';
import { PokemonDetailModal } from './PokemonDetailModal';
import { usePokemonSearch } from '../../hooks/usePokemon';
import { LogOut } from 'lucide-react';

export function PokemonListPage() {
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePokemonSearch({
    name: searchQuery,
    pageSize: 20,
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handlePokemonClick = (pokemonName: string) => {
    setSelectedPokemon(pokemonName);
  };

  const handleCloseModal = () => {
    setSelectedPokemon(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten all pages of results
  const allPokemon = data?.pages.flatMap(page => page.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Pokédex</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <PokemonSearch onSearch={handleSearch} isLoading={isLoading} />
          {searchQuery && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {isLoading ? 'Searching...' : `Found ${totalCount} Pokémon matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">Failed to load Pokémon</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && allPokemon.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pokémon Found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No Pokémon match your search for "${searchQuery}"`
                : "Start by searching for a Pokémon name"
              }
            </p>
          </div>
        )}

        {/* Pokemon Grid */}
        {allPokemon.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allPokemon.map((pokemon) => (
              <PokemonCard
                key={`${pokemon.id}-${pokemon.name}`}
                pokemon={pokemon}
                onClick={() => handlePokemonClick(pokemon.name)}
              />
            ))}
          </div>
        )}

        {/* Loading More */}
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading more Pokémon...</div>
          </div>
        )}

        {/* Load More Button (fallback for infinite scroll) */}
        {hasNextPage && !isFetchingNextPage && allPokemon.length > 0 && (
          <div className="text-center py-8">
            <Button onClick={() => fetchNextPage()}>
              Load More Pokémon
            </Button>
          </div>
        )}

        {/* Initial Loading */}
        {isLoading && allPokemon.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border p-4 animate-pulse"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Pokemon Detail Modal */}
      <PokemonDetailModal
        pokemonName={selectedPokemon}
        isOpen={!!selectedPokemon}
        onClose={handleCloseModal}
      />
    </div>
  );
}
