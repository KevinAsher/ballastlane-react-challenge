
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
import { usePokemonDetail } from '../../hooks/usePokemon';
import type { PokemonDetail } from '../../types';

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

function OverviewTab({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-4">
        {pokemon.sprites.other?.['official-artwork']?.front_default && (
          <img
            src={pokemon.sprites.other['official-artwork'].front_default}
            alt={pokemon.name}
            className="w-48 h-48 object-contain"
          />
        )}
        <div className="text-center">
          <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
          <p className="text-gray-600">#{pokemon.id.toString().padStart(3, '0')}</p>
        </div>
        <div className="flex gap-2">
          {pokemon.types.map((typeSlot) => (
            <Badge
              key={typeSlot.type.name}
              className={`text-white ${typeColors[typeSlot.type.name] || 'bg-gray-400'}`}
            >
              {typeSlot.type.name}
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

function StatsTab({ pokemon }: { pokemon: PokemonDetail }) {
  const maxStat = Math.max(...pokemon.stats.map(statSlot => statSlot.base_stat));
  
  return (
    <div className="space-y-4">
      {pokemon.stats.map((statSlot) => (
        <div key={statSlot.stat.name} className="space-y-2">
          <div className="flex justify-between">
            <span className="capitalize font-medium">{statSlot.stat.name.replace('-', ' ')}</span>
            <span className="font-bold">{statSlot.base_stat}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(statSlot.base_stat / maxStat) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AbilitiesTab({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <div className="space-y-4">
      {pokemon.abilities.map((abilitySlot, index) => {
        // Get the first English effect if available
        const englishEffect = abilitySlot.ability.effect_entries?.find(
          entry => entry.language.name === 'en'
        )?.effect;
        
        return (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="capitalize">{abilitySlot.ability.name.replace('-', ' ')}</span>
                {abilitySlot.is_hidden && (
                  <Badge variant="outline" className="text-xs">Hidden</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {englishEffect || 'No description available.'}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MovesTab({ pokemon }: { pokemon: PokemonDetail }) {
  // Group moves by learn method and extract details
  const movesByMethod = pokemon.moves.reduce((acc, moveSlot) => {
    // Get the latest version group details for this move
    const versionDetail = moveSlot.version_group_details[0];
    const method = versionDetail?.move_learn_method.name || 'unknown';
    
    if (!acc[method]) {
      acc[method] = [];
    }
    
    acc[method].push({
      name: moveSlot.move.name,
      url: moveSlot.move.url,
      learn_method: method,
      level_learned_at: versionDetail?.level_learned_at,
    });
    
    return acc;
  }, {} as Record<string, Array<{name: string; url: string; learn_method: string; level_learned_at?: number}>>);

  return (
    <ScrollArea className="h-96">
      <div className="space-y-6">
        {Object.entries(movesByMethod).map(([method, moves]) => (
          <div key={method}>
            <h3 className="font-semibold mb-2 capitalize">{method.replace('-', ' ')}</h3>
            <div className="grid grid-cols-1 gap-2">
              {moves.map((move, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="capitalize">{move.name.replace('-', ' ')}</span>
                  {move.level_learned_at && move.level_learned_at > 0 && (
                    <Badge variant="outline">Lv. {move.level_learned_at}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function FormsTab({ pokemon }: { pokemon: PokemonDetail }) {
  return (
    <div className="space-y-4">
      {pokemon.forms.map((form, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <span className="capitalize">{form.name.replace('-', ' ')}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SpritesTab({ pokemon }: { pokemon: PokemonDetail }) {
  const sprites = [
    { name: 'Front Default', url: pokemon.sprites.front_default },
    { name: 'Back Default', url: pokemon.sprites.back_default },
    { name: 'Front Shiny', url: pokemon.sprites.front_shiny },
    { name: 'Back Shiny', url: pokemon.sprites.back_shiny },
  ].filter(sprite => sprite.url);

  return (
    <div className="grid grid-cols-2 gap-4">
      {sprites.map((sprite) => (
        <Card key={sprite.name}>
          <CardHeader>
            <CardTitle className="text-sm">{sprite.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <img
              src={sprite.url!}
              alt={`${pokemon.name} ${sprite.name}`}
              className="w-24 h-24 object-contain"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PokemonDetailModal({ pokemonName, isOpen, onClose }: PokemonDetailModalProps) {
  const { data: pokemon, isLoading, error } = usePokemonDetail(pokemonName || '');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {pokemon ? `${pokemon.name} Details` : 'Pokemon Details'}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-lg">Loading...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="text-red-600">Failed to load Pokemon details</div>
          </div>
        )}

        {pokemon && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="abilities">Abilities</TabsTrigger>
              <TabsTrigger value="moves">Moves</TabsTrigger>
              <TabsTrigger value="forms">Forms</TabsTrigger>
              <TabsTrigger value="sprites">Sprites</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-96 mt-4">
              <TabsContent value="overview">
                <OverviewTab pokemon={pokemon} />
              </TabsContent>

              <TabsContent value="stats">
                <StatsTab pokemon={pokemon} />
              </TabsContent>

              <TabsContent value="abilities">
                <AbilitiesTab pokemon={pokemon} />
              </TabsContent>

              <TabsContent value="moves">
                <MovesTab pokemon={pokemon} />
              </TabsContent>

              <TabsContent value="forms">
                <FormsTab pokemon={pokemon} />
              </TabsContent>

              <TabsContent value="sprites">
                <SpritesTab pokemon={pokemon} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
