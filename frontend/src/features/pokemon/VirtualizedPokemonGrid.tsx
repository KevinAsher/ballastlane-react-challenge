import { Virtuoso } from 'react-virtuoso';
import { HolographicCard } from './PokemonHolographicCard';
import { HolographicCardSkeleton } from './HolographicCardSkeleton';
import { useWindowSize } from '../../hooks/useWindowSize';
import type { Pokemon } from '../../types/pokemon';

interface VirtualizedPokemonGridProps {
  pokemon: Pokemon[];
  onPokemonClick: (pokemonName: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function VirtualizedPokemonGrid({ 
  pokemon, 
  onPokemonClick, 
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  isLoading = false 
}: VirtualizedPokemonGridProps) {
  const { width } = useWindowSize();
  
  // Calculate responsive columns based on screen width
  const getColumns = () => {
    if (width < 640) return 1; // sm
    if (width < 768) return 2; // md
    if (width < 1024) return 3; // lg
    return 4; // xl
  };

  const columns = getColumns();

  // Group pokemon into rows for the grid layout
  const rows: Pokemon[][] = [];
  for (let i = 0; i < pokemon.length; i += columns) {
    rows.push(pokemon.slice(i, i + columns));
  }

  // Add loading rows if fetching more
  if (isFetchingNextPage) {
    const skeletonRows = Math.ceil(8 / columns);
    for (let i = 0; i < skeletonRows; i++) {
      rows.push([]);
    }
  }

  const itemContent = (index: number) => {
    const row = rows[index];
    const isLoadingRow = !row || row.length === 0;

    return (
      <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {isLoadingRow ? (
          // Show skeleton cards for loading rows
          Array.from({ length: columns }).map((_, colIndex) => (
            <HolographicCardSkeleton key={`skeleton-${index}-${colIndex}`} />
          ))
        ) : (
          // Show actual pokemon cards, padding with empty divs if needed
          Array.from({ length: columns }).map((_, colIndex) => {
            const pokemonItem = row[colIndex];
            if (pokemonItem) {
              return (
                <HolographicCard
                  key={`${pokemonItem.id}-${pokemonItem.name}`}
                  pokemon={pokemonItem}
                  onClick={() => onPokemonClick(pokemonItem.name)}
                />
              );
            }
            return <div key={`empty-${index}-${colIndex}`} />;
          })
        )}
      </div>
    );
  };

  const endReached = () => {
    if (hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  };

  // Show initial loading state
  if (isLoading && pokemon.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <HolographicCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <Virtuoso
      useWindowScroll
      totalCount={rows.length}
      itemContent={itemContent}
      endReached={endReached}
      overscan={8}
    />
  );
}
