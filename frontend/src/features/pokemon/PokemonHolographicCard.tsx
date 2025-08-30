"use client"

import { useState } from "react"
//import { type EnhancedPokemon, typeColors } from "@/lib/pokemon-data"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Sparkles, Zap, Shield, Sword, Crown, Star } from "lucide-react"
import type { PokemonListItem } from "@/types/pokemon"

interface HolographicCardProps {
	//   pokemon: EnhancedPokemon
	pokemon: PokemonListItem
	onClick: () => void
}

export function HolographicCard({ pokemon, onClick }: HolographicCardProps) {
	const [isHovered, setIsHovered] = useState(false)
	const primaryType = pokemon.types[0]?.type.name || "normal"
	const primaryColor = typeColors[primaryType] || "#A8A878"

	// const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)
	// const maxPossibleStats = 720
	// const powerLevel = Math.round((totalStats / maxPossibleStats) * 100)

	return (
		<Card
			className="group relative overflow-hidden cursor-pointer transition-all duration-700 hover:scale-105 hover:shadow-2xl border-0 h-[420px]"
			style={{
				background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}25 50%, ${primaryColor}10 100%)`,
				boxShadow: isHovered
					? `0 25px 50px -12px ${primaryColor}40, 0 0 0 1px ${primaryColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`
					: `0 10px 25px -5px ${primaryColor}20`,
			}}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div
				className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700"
				style={{
					background: `linear-gradient(45deg, transparent 30%, ${primaryColor}30 50%, transparent 70%)`,
					transform: isHovered ? "translateX(100%)" : "translateX(-100%)",
					transition: "transform 0.8s ease-in-out",
				}}
			/>

			<div
				className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-all duration-500 delay-200"
				style={{
					background: `radial-gradient(circle at 50% 50%, ${primaryColor}20 0%, transparent 70%)`,
				}}
			/>

			<div className="absolute top-4 right-4 z-10 flex items-center gap-2">
				{pokemon.species_data.legendary && (
					<div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black backdrop-blur-sm">
						<Crown className="w-3 h-3" />
						<span className="text-xs font-bold">LEGENDARY</span>
					</div>
				)}
				<div className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm">
					<Sparkles className="w-3 h-3 text-yellow-400" />
					<span className="text-xs font-bold text-white">{pokemon.rarity_score}</span>
				</div>
			</div>

			{/* Pokemon ID */}
			<div className="absolute top-4 left-4 z-10">
				<Badge variant="secondary" className="bg-black/30 text-white border-0 backdrop-blur-sm font-bold">
					#{pokemon.id.toString().padStart(3, "0")}
				</Badge>
			</div>

			<div className="relative p-6 h-full flex flex-col">
				<div className="relative mb-6 flex justify-center flex-shrink-0">
					<div
						className="relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110"
						style={{
							background: `radial-gradient(circle, ${primaryColor}25 0%, ${primaryColor}10 50%, transparent 80%)`,
							boxShadow: `0 0 40px ${primaryColor}30`,
						}}
					>
						<img
							src={
								pokemon.sprites.other["official-artwork"].front_default ||
								pokemon.sprites.front_default ||
								"/placeholder.svg?height=144&width=144" ||
								"/placeholder.svg"
							}
							alt={pokemon.name}
							className="w-32 h-32 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:rotate-12"
						/>

						<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
							{[...Array(8)].map((_, i) => (
								<div
									key={i}
									className="absolute w-1.5 h-1.5 rounded-full animate-pulse"
									style={{
										backgroundColor: primaryColor,
										top: `${15 + Math.random() * 70}%`,
										left: `${15 + Math.random() * 70}%`,
										animationDelay: `${i * 0.15}s`,
										animationDuration: `${1.5 + Math.random()}s`,
									}}
								/>
							))}
						</div>
					</div>
				</div>

				<div className="text-center mb-4 flex-shrink-0">
					<h3 className="text-2xl font-bold capitalize text-balance mb-2" style={{ color: primaryColor }}>
						{pokemon.name}
					</h3>
					<p className="text-sm text-muted-foreground capitalize">{pokemon.species_data.habitat} Pokémon</p>
				</div>

				{/* Types */}
				<div className="flex justify-center gap-2 mb-6 flex-shrink-0">
					{pokemon.types.map((type) => (
						<Badge
							key={type.type.name}
							className="capitalize text-white border-0 shadow-lg px-3 py-1 font-medium"
							style={{ backgroundColor: typeColors[type.type.name] }}
						>
							{type.type.name}
						</Badge>
					))}
				</div>

				<div className="grid grid-cols-3 gap-4 mb-6 flex-shrink-0">
					<div className="text-center p-3 rounded-lg bg-black/10 backdrop-blur-sm">
						<div className="flex items-center justify-center mb-2">
							<Zap className="w-5 h-5 text-yellow-500" />
						</div>
						{/*             <div className="text-lg font-bold" style={{ color: primaryColor }}>
              {powerLevel}%
            </div> */}
						<div className="text-xs text-muted-foreground font-medium">Power</div>
					</div>
					<div className="text-center p-3 rounded-lg bg-black/10 backdrop-blur-sm">
						<div className="flex items-center justify-center mb-2">
							<Shield className="w-5 h-5 text-blue-500" />
						</div>
						<div className="text-lg font-bold" style={{ color: primaryColor }}>
							{pokemon.stats[2].base_stat}
						</div>
						<div className="text-xs text-muted-foreground font-medium">Defense</div>
					</div>
					<div className="text-center p-3 rounded-lg bg-black/10 backdrop-blur-sm">
						<div className="flex items-center justify-center mb-2">
							<Sword className="w-5 h-5 text-red-500" />
						</div>
						<div className="text-lg font-bold" style={{ color: primaryColor }}>
							{pokemon.stats[1].base_stat}
						</div>
						<div className="text-xs text-muted-foreground font-medium">Attack</div>
					</div>
				</div>

				<div className="space-y-3 flex-grow">
					<div className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
						<Star className="w-4 h-4" />
						Signature Abilities
					</div>
					<div className="flex flex-wrap gap-2">
						{pokemon.abilities.slice(0, 2).map((ability) => (
							<Badge
								key={ability.ability.name}
								variant="outline"
								className="text-xs capitalize bg-white/10 border-white/20 text-white"
							>
								{ability.ability.name.replace("-", " ")}
								{ability.is_hidden && " ★"}
							</Badge>
						))}
					</div>
				</div>

				<div className="mt-auto pt-4 text-center flex-shrink-0">
					<Badge
						className="text-sm font-bold px-4 py-2 shadow-lg"
						style={{
							backgroundColor: `${primaryColor}30`,
							color: primaryColor,
							border: `1px solid ${primaryColor}50`,
						}}
					>
						{pokemon.competitive_tier} Tier • Gen {pokemon.species_data.generation}
					</Badge>
				</div>
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
