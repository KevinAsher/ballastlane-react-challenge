import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  usePokemonOverview, 
  usePokemonAbilities, 
  usePokemonMoves, 
  usePokemonForms 
} from '../../hooks/usePokemon';


interface PokemonDetailModalProps {
  pokemonName: string | null;
  isOpen: boolean;
  onClose: () => void;
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

function OverviewTab({ pokemonName }: { pokemonName: string }) {
  const { data: pokemon, isLoading, error } = usePokemonOverview(pokemonName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading overview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Failed to load overview</div>
      </div>
    );
  }

  if (!pokemon) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
          <p className="text-gray-600">#{pokemon.id.toString().padStart(3, '0')}</p>
        </div>
        <div className="flex gap-2">
          {pokemon.types.map((type, index) => (
            <Badge
              key={index}
              className={`text-white ${typeColors[type] || 'bg-gray-400'}`}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{pokemon.height / 10}m</div>
            <div className="text-sm text-gray-600">Height</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{pokemon.weight / 10}kg</div>
            <div className="text-sm text-gray-600">Weight</div>
          </CardContent>
        </Card>
      </div>
      
      {pokemon.base_experience && (
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{pokemon.base_experience}</div>
            <div className="text-sm text-gray-600">Base Experience</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AbilitiesTab({ pokemonName }: { pokemonName: string }) {
  const { data: abilitiesData, isLoading, error } = usePokemonAbilities(pokemonName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading abilities...</div>
      </div>
    );
  }

 if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Failed to load abilities</div>
      </div>
    );
  }

  if (!abilitiesData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {abilitiesData.map((ability, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="capitalize">{ability.name.replace('-', ' ')}</span>
              {ability.is_hidden && (
                <Badge variant="outline" className="text-xs">Hidden</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {ability.effect || 'No description available.'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MovesTab({ pokemonName }: { pokemonName: string }) {
  const { data: movesData, isLoading, error } = usePokemonMoves(pokemonName);

  // Group moves by learn method
  const movesByMethod = React.useMemo(() => {
    if (!movesData) return {};
    
    return movesData.reduce((groups, move) => {
      const method = move.learn_method;
      if (!groups[method]) {
        groups[method] = [];
      }
      groups[method].push(move);
      return groups;
    }, {} as Record<string, typeof movesData>);
  }, [movesData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading moves...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Failed to load moves</div>
      </div>
    );
  }

  if (!movesData) {
    return null;
  }


  return (
    <ScrollArea className="h-96">
      <div className="space-y-6">
        {Object.entries(movesByMethod).map(([method, moves]) => (
          <div key={method}>
            <h3 className="font-semibold mb-2 capitalize">{method.replace('-', ' ')}</h3>
            <div className="grid grid-cols-1 gap-2">
              {moves.map((move, index) => (
                <Card key={index}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="capitalize font-medium">{move.name.replace('-', ' ')}</span>
                      <div className="flex gap-1">
                        {move.level_learned_at && move.level_learned_at > 0 && (
                          <Badge variant="outline">Lv. {move.level_learned_at}</Badge>
                        )}
                        {move.type && (
                          <Badge 
                            className={`text-white text-xs ${typeColors[move.type] || 'bg-gray-400'}`}
                          >
                            {move.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {(move.power || move.accuracy || move.pp) && (
                      <div className="flex gap-4 text-xs text-gray-600 mb-2">
                        {move.power && <span>Power: {move.power}</span>}
                        {move.accuracy && <span>Accuracy: {move.accuracy}%</span>}
                        {move.pp && <span>PP: {move.pp}</span>}
                      </div>
                    )}
                    {move.description && (
                      <p className="text-xs text-gray-700">{move.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function FormsTab({ pokemonName }: { pokemonName: string }) {
  const { data: formsData, isLoading, error } = usePokemonForms(pokemonName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading forms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Failed to load forms</div>
      </div>
    );
  }

  if (!formsData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {formsData.map((form, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="capitalize font-medium">{form.name.replace('-', ' ')}</span>
                <div className="flex gap-2">
                  {form.is_default && (
                    <Badge variant="outline" className="text-xs">Default</Badge>
                  )}
                  {form.is_mega && (
                    <Badge variant="outline" className="text-xs">Mega</Badge>
                  )}
                  {form.is_battle_only && (
                    <Badge variant="outline" className="text-xs">Battle Only</Badge>
                  )}
                </div>
              </div>
              {form.sprites?.front_default && (
                <img
                  src={form.sprites.front_default}
                  alt={form.name}
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PokemonDetailModal({ pokemonName, isOpen, onClose }: PokemonDetailModalProps) {
  if (!pokemonName) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            <span className="capitalize">{pokemonName}</span> Details
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="abilities">Abilities</TabsTrigger>
            <TabsTrigger value="moves">Moves</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96 mt-4">
            <TabsContent value="overview">
              <OverviewTab pokemonName={pokemonName} />
            </TabsContent>

            <TabsContent value="abilities">
              <AbilitiesTab pokemonName={pokemonName} />
            </TabsContent>

            <TabsContent value="moves">
              <MovesTab pokemonName={pokemonName} />
            </TabsContent>

            <TabsContent value="forms">
              <FormsTab pokemonName={pokemonName} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}