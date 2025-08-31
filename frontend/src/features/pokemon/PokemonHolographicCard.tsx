import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkles, Zap, Shield, Sword } from "lucide-react"
import type { Pokemon } from "@/types/pokemon"
import { typeColors } from "./utils"


export function HolographicCard({ pokemon, onClick, ...props }: HolographicCardProps) {
	const [isHovered, setIsHovered] = useState(false)
	const primaryType = pokemon.types?.[0] || "normal"
	const primaryColor = typeColors[primaryType] || "#A8A878"
	const stats = pokemon.stats?.reduce((acc, stat) => {
		acc[stat.name] = stat;
		return acc
	}, {} as Record<string, Pokemon['stats'][number]>) || {};


	return (
		<Card
			className="group relative overflow-hidden cursor-pointer transition-all duration-1000 hover:scale-105 border-0 h-[420px]"
			style={{
				background: `linear-gradient(135deg, rgba(10,10,10,0.95) 0%, ${primaryColor}15 30%, ${primaryColor}25 50%, ${primaryColor}15 70%, rgba(10,10,10,0.95) 100%)`,
				boxShadow: isHovered
					? `0 0 40px ${primaryColor}40, inset 0 0 40px ${primaryColor}10`
					: `0 5px 22px ${primaryColor}30`,
			}}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			{...props}
		>
			{/* Quantum Effects */}
			<QuantumField primaryColor={primaryColor} />
			<QuantumParticles primaryColor={primaryColor} />

			{/* Top Badges */}
			<CardBadges pokemonId={pokemon.id} speed={stats['speed']?.value || 0} />

			<div className="relative p-6 h-full flex flex-col">
				{/* Pokemon Image */}
				    <PokemonImage pokemon={pokemon} primaryColor={primaryColor} />

				{/* Pokemon Info */}
				<PokemonInfo pokemon={pokemon} primaryColor={primaryColor} />

				{/* Type Badges */}
				<TypeBadges types={pokemon.types} />

				{/* Stats Grid */}
				<StatsGrid stats={stats} primaryColor={primaryColor} />
			</div>

			<div
				className="absolute bottom-0 left-0 right-0 h-20 opacity-60"
				style={{
					background: `linear-gradient(to top, ${primaryColor}50, transparent)`,
				}}
			/>
		</Card>
	)
}

function QuantumField({ primaryColor }: QuantumEffectsProps) {
	return (
		<div className="absolute inset-0 opacity-30">
			<div
				className="absolute inset-0 animate-pulse"
				style={{
					background: `radial-gradient(circle at 30% 20%, ${primaryColor}40 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${primaryColor}30 0%, transparent 50%)`,
				}}
			/>
		</div>
	)
}

function QuantumParticles({ primaryColor }: QuantumEffectsProps) {
	return (
		<div className="absolute inset-0 overflow-hidden">
			{[...Array(8)].map((_, i) => (
				<div
					key={i}
					className="absolute w-1 h-1 rounded-full animate-ping"
					style={{
						backgroundColor: primaryColor,
						top: `${Math.random() * 100}%`,
						left: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 2}s`,
						animationDuration: `${1 + Math.random() * 2}s`,
						opacity: 0.15,
					}}
				/>
			))}
		</div>
	)
}

function CardBadges({ pokemonId, speed }: CardBadgesProps) {
	return (
		<>
			{/* Speed badge - top right */}
			<div className="absolute top-4 right-4 z-10 flex items-center gap-2">
				<div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
					<Sparkles className="w-3 h-3 text-yellow-400" />
					<span className="text-xs font-bold text-white">{speed}</span>
				</div>
			</div>

			{/* Pokemon ID - top left */}
			<div className="absolute top-4 left-4 z-10">
				<Badge variant="secondary" className="bg-black/30 text-white border-0 backdrop-blur-sm font-bold">
					#{pokemonId?.toString().padStart(3, "0")}
				</Badge>
			</div>
		</>
	)
}

function PokemonImage({ pokemon, primaryColor }: PokemonImageProps) {
	return (
		<div className="relative mb-1 flex justify-center flex-shrink-0">
			<div className="relative w-36 h-36 flex items-center justify-center transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-2">
				{/* Background integration layer */}
				<div 
					className="absolute inset-0 rounded-full opacity-30 transition-all duration-500 group-hover:opacity-50"
					style={{
						background: `radial-gradient(circle, ${primaryColor}20 0%, ${primaryColor}10 40%, transparent 70%)`,
					}}
				/>
				
				<img
					src={
						pokemon.sprites?.front_default ||
						"/placeholder.svg?height=144&width=144" ||
						"/placeholder.svg"
					}
					alt={pokemon.name}
					className="w-32 h-32 object-contain transition-all duration-500 group-hover:scale-100 relative z-10"
				/>
			</div>
		</div>
	)
}

function PokemonInfo({ pokemon, primaryColor }: PokemonInfoProps) {
	return (
		<div className="text-center mb-4 flex-shrink-0">
			<h3 className="text-2xl font-bold capitalize text-balance mb-2" style={{ color: primaryColor }}>
				{pokemon.name}
			</h3>
			<p className="text-sm text-muted-foreground capitalize">
				{pokemon.species?.name || "Unknown Habitat"} Pokémon
			</p>
		</div>
	)
}

function TypeBadges({ types }: TypeBadgesProps) {
	return (
		<div className="flex justify-center gap-2 mb-6 flex-shrink-0">
			{types?.map((type) => (
				<Badge
					key={type}
					className="capitalize text-white border-0 shadow-lg px-3 py-1 font-medium"
					style={{ backgroundColor: typeColors[type] }}
				>
					{type}
				</Badge>
			))}
		</div>
	)
}

function StatsGrid({ stats, primaryColor }: StatsGridProps) {
	return (
		<div className="grid grid-cols-3 gap-4 mb-6 flex-shrink-0">
			<div className="text-center p-3 rounded-lg bg-black/10 backdrop-blur-sm">
				<div className="flex items-center justify-center mb-2">
					<Zap className="w-5 h-5 text-yellow-500" />
				</div>
				<div className="text-lg font-bold" style={{ color: primaryColor }}>
					{stats['speed']?.value || 0}
				</div>
				<div className="text-xs text-muted-foreground font-medium">Speed</div>
			</div>
			<div className="text-center p-3 rounded-lg bg-black/10 backdrop-blur-sm">
				<div className="flex items-center justify-center mb-2">
					<Shield className="w-5 h-5 text-blue-500" />
				</div>
				<div className="text-lg font-bold" style={{ color: primaryColor }}>
					{stats['defense']?.value || 0}
				</div>
				<div className="text-xs text-muted-foreground font-medium">Defense</div>
			</div>
			<div className="text-center p-3 rounded-lg bg-black/10 backdrop-blur-sm">
				<div className="flex items-center justify-center mb-2">
					<Sword className="w-5 h-5 text-red-500" />
				</div>
				<div className="text-lg font-bold" style={{ color: primaryColor }}>
					{stats['attack']?.value || 0}
				</div>
				<div className="text-xs text-muted-foreground font-medium">Attack</div>
			</div>
		</div>
	)
}


interface HolographicCardProps {
	pokemon: Pokemon
	onClick: () => void
	'data-testid'?: string
	'data-pokemon'?: string
}

interface CardBadgesProps {
	pokemonId: number
	speed: number
}

interface PokemonImageProps {
	pokemon: Pokemon
	primaryColor: string
}

interface PokemonInfoProps {
	pokemon: Pokemon
	primaryColor: string
}

interface TypeBadgesProps {
	types: string[]
}

interface StatsGridProps {
	stats: Record<string, Pokemon['stats'][number]>
	primaryColor: string
}

interface QuantumEffectsProps {
	primaryColor: string
}