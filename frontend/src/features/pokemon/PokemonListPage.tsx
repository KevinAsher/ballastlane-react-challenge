import { useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '../../components/ui/button';
import { PokemonSearch } from './PokemonSearch';
// import { PokemonCard } from './PokemonCard'; // Commented out - using HolographicCard instead
import { VirtualizedPokemonGrid } from './VirtualizedPokemonGrid';
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

  // Virtuoso handles infinite scroll automatically via endReached callback

  // Flatten all pages of results
  const allPokemon = data?.pages.flatMap(page => page.items) ?? [];
  const totalCount = data?.pages[0]?.total ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Pokédex</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {user?.username}</span>
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
          <PokemonSearch onSearch={handleSearch} />
          {searchQuery && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              {isLoading ? 'Searching...' : `Found ${totalCount} Pokémon matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-destructive mb-4">Failed to load Pokémon</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && allPokemon.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">No Pokémon Found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No Pokémon match your search for "${searchQuery}"`
                : "Start by searching for a Pokémon name"
              }
            </p>
          </div>
        )}

        {/* Pokemon Grid - Virtualized for Performance */}
        {(allPokemon.length > 0 || isLoading) && (
          <VirtualizedPokemonGrid
            pokemon={allPokemon}
            onPokemonClick={handlePokemonClick}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            isLoading={isLoading}
          />
        )}

        {/* Fallback: Regular Grid Implementation (commented out)
        {allPokemon.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {allPokemon.map((pokemon) => (
              <HolographicCard
                key={`${pokemon.id}-${pokemon.name}`}
                pokemon={pokemon}
                onClick={() => handlePokemonClick(pokemon.name)}
              />
            ))}
          </div>
        )}
        */}
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
