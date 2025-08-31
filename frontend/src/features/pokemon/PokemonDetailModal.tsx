import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
  usePokemonOverview, 
  usePokemonAbilities, 
  usePokemonMoves, 
  usePokemonForms 
} from '../../hooks/usePokemon';
import { 
  Heart, 
  Sword, 
  Zap, 
  Target, 
  Sparkles, 
  Star,
  Gauge,
  Trophy,
  Eye,
  Wand2
} from 'lucide-react';


interface PokemonDetailModalProps {
  pokemonName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
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
};



function OverviewTab({ pokemonName }: { pokemonName: string }) {
  const { data: pokemon, isLoading, error } = usePokemonOverview(pokemonName);
  const primaryType = pokemon?.types?.[0] || "normal";
  const primaryColor = typeColors[primaryType] || "#A8A878";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-white/70">Loading overview...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400">Failed to load overview</div>
      </div>
    );
  }

  if (!pokemon) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Pokemon Header */}
      <div className="relative overflow-hidden rounded-xl p-6" 
        style={{
          background: `linear-gradient(135deg, rgba(10,10,10,0.8) 0%, ${primaryColor}20 50%, rgba(10,10,10,0.8) 100%)`,
          border: `1px solid ${primaryColor}30`
        }}>
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-white">
              #{pokemon.id.toString().padStart(3, '0')}
            </span>
          </div>
          <h2 className="text-3xl font-bold capitalize text-white mb-2">{pokemon.name}</h2>
          <div className="flex justify-center gap-2">
            {pokemon.types.map((type, index) => (
              <Badge
                key={index}
                className="text-white border-0 shadow-lg px-4 py-2 font-medium text-sm"
                style={{ backgroundColor: typeColors[type] }}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-ping"
              style={{
                backgroundColor: primaryColor,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Physical Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-center">
          <div className="flex items-center justify-center mb-2">
            <Gauge className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{pokemon.height / 10}m</div>
          <div className="text-sm text-white/70">Height</div>
        </div>
        
        <div className="p-4 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{pokemon.weight / 10}kg</div>
          <div className="text-sm text-white/70">Weight</div>
        </div>
      </div>
      
      {/* Base Experience */}
      {pokemon.base_experience && (
        <div className="p-6 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10 text-center">
          <div className="flex items-center justify-center mb-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{pokemon.base_experience}</div>
          <div className="text-sm text-white/70 uppercase tracking-wider">Base Experience</div>
          
          {/* Experience bar visualization */}
          <div className="mt-4 w-full bg-black/20 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${Math.min((pokemon.base_experience / 300) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${primaryColor}80, ${primaryColor})`,
                boxShadow: `0 0 10px ${primaryColor}60`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AbilitiesTab({ pokemonName }: { pokemonName: string }) {
  const { data: abilitiesData, isLoading, error } = usePokemonAbilities(pokemonName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-white/70">Loading abilities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400">Failed to load abilities</div>
      </div>
    );
  }

  if (!abilitiesData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {abilitiesData.map((ability, index) => (
        <div 
          key={index}
          className="relative overflow-hidden rounded-xl p-6 bg-black/20 backdrop-blur-sm border border-white/10"
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-30" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30">
                <Wand2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold capitalize text-white">
                  {ability.name.replace('-', ' ')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {ability.is_hidden && (
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Hidden Ability
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-white/80 leading-relaxed">
              {ability.effect || 'No description available.'}
            </p>
          </div>
          
          {/* Sparkle effect */}
          <div className="absolute top-2 right-2">
            <Sparkles className="w-4 h-4 text-blue-400 opacity-70" />
          </div>
        </div>
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
        <div className="text-lg text-white/70">Loading moves...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400">Failed to load moves</div>
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
            <div className="flex items-center gap-2 mb-4">
              <Sword className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold capitalize text-white">
                Level Up
              </h3>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-400/50 to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {moves.map((move, index) => {
                const moveTypeColor = typeColors[move.type || 'normal'] || '#A8A878';
                return (
                  <div 
                    key={index}
                    className="relative overflow-hidden rounded-lg p-4 bg-black/20 backdrop-blur-sm border border-white/10"
                  >
                    {/* Type-based background accent */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 opacity-70"
                      style={{ backgroundColor: moveTypeColor }}
                    />
                    
                    <div className="ml-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="capitalize font-semibold text-white text-lg">
                          {move.name.replace('-', ' ')}
                        </h4>
                        <div className="flex gap-2">
                          {move.level_learned_at && move.level_learned_at > 0 && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs">
                              Lv. {move.level_learned_at}
                            </Badge>
                          )}
                          {move.type && (
                            <Badge 
                              className="text-white text-xs border-0"
                              style={{ backgroundColor: moveTypeColor }}
                            >
                              {move.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {(move.power || move.accuracy || move.pp) && (
                        <div className="flex gap-6 mb-3">
                          {move.power && (
                            <div className="flex items-center gap-1">
                              <Sword className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-white/80">
                                Power: <span className="font-semibold text-red-400">{move.power}</span>
                              </span>
                            </div>
                          )}
                          {move.accuracy && (
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-white/80">
                                Accuracy: <span className="font-semibold text-blue-400">{move.accuracy}%</span>
                              </span>
                            </div>
                          )}
                          {move.pp && (
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-white/80">
                                PP: <span className="font-semibold text-yellow-400">{move.pp}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {move.description && (
                        <p className="text-sm text-white/70 leading-relaxed">
                          {move.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
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
        <div className="text-lg text-white/70">Loading forms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400">Failed to load forms</div>
      </div>
    );
  }

  if (!formsData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {formsData.map((form, index) => (
        <div 
          key={index}
          className="relative overflow-hidden rounded-xl p-6 bg-black/20 backdrop-blur-sm border border-white/10"
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 opacity-30" />
          
          <div className="relative flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold capitalize text-white">
                  {form.name.replace('-', ' ')}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {form.is_default && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Default Form
                  </Badge>
                )}
                {form.is_mega && (
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Mega Evolution
                  </Badge>
                )}
                {form.is_battle_only && (
                  <Badge className="bg-red-500/20 text-red-300 border border-red-500/30 text-xs">
                    <Sword className="w-3 h-3 mr-1" />
                    Battle Only
                  </Badge>
                )}
              </div>
            </div>
            
            {form.sprites?.front_default && (
              <div className="relative ml-4">
                <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={form.sprites.front_default}
                    alt={form.name}
                    className="w-16 h-16 object-contain"
                    loading="lazy"
                    data-testid="pokemon-image"
                  />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PokemonDetailModal({ pokemonName, isOpen, onClose }: PokemonDetailModalProps) {
  const { data: pokemon } = usePokemonOverview(pokemonName || '');
  const primaryType = pokemon?.types?.[0] || "normal";
  const primaryColor = typeColors[primaryType] || "#A8A878";
  
  if (!pokemonName) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-hidden border-0 p-0"
        style={{
          boxShadow: `0 25px 50px -12px ${primaryColor}40, 0 0 0 1px ${primaryColor}30`,
        }}
        data-testid="pokemon-detail-modal"
      >
        {/* Enhanced Modal Header */}
        <div 
          className="relative overflow-hidden px-8 py-6 border-b"
          style={{ 
            borderColor: `${primaryColor}30`,
            background: `linear-gradient(135deg, rgba(10,10,10,0.95) 0%, ${primaryColor}15 50%, rgba(10,10,10,0.95) 100%)`
          }}
        >
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-ping"
                style={{
                  backgroundColor: primaryColor,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  opacity: 0.2,
                }}
              />
            ))}
          </div>
          
          <DialogHeader className="relative">
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold capitalize text-white" data-testid="pokemon-name">
                  {pokemonName}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Enhanced Tab System */}
        <div className="px-8 pb-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList 
              className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-1 mt-6"
            >
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 border-0 transition-all duration-300"
              >
                <Heart className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="abilities" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 border-0 transition-all duration-300"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Abilities
              </TabsTrigger>
              <TabsTrigger 
                value="moves" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 border-0 transition-all duration-300"
              >
                <Sword className="w-4 h-4 mr-2" />
                Moves
              </TabsTrigger>
              <TabsTrigger 
                value="forms" 
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70 border-0 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Forms
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px] mt-6">
              <TabsContent value="overview" className="mt-0">
                <OverviewTab pokemonName={pokemonName} />
              </TabsContent>

              <TabsContent value="abilities" className="mt-0">
                <AbilitiesTab pokemonName={pokemonName} />
              </TabsContent>

              <TabsContent value="moves" className="mt-0">
                <MovesTab pokemonName={pokemonName} />
              </TabsContent>

              <TabsContent value="forms" className="mt-0">
                <FormsTab pokemonName={pokemonName} />
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}