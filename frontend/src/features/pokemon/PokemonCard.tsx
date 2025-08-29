import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import type { PokemonListItem } from '../../types';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  onClick: () => void;
}

const typeColors: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-400',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-3">
          {/* Pokemon Image */}
          <div className="w-24 h-24 flex items-center justify-center bg-gray-50 rounded-lg">
            {pokemon.sprite ? (
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-20 h-20 object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Pokemon Info */}
          <div className="text-center space-y-2 w-full">
            <div className="text-sm text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</div>
            <h3 className="font-semibold text-lg capitalize">{pokemon.name}</h3>
            
            {/* Types */}
            <div className="flex flex-wrap gap-1 justify-center">
              {pokemon.types.map((type) => (
                <Badge
                  key={type}
                  className={`text-white text-xs ${typeColors[type] || 'bg-gray-400'}`}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
