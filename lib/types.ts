// Skill entity from monster-service
export interface Skill {
	id: number;
	skillNumber: number;
	name: string;
	baseDamage: number;
	scalingStat: "HP" | "ATK" | "DEF" | "VIT";
	scalingRatio: number;
	cooldown: number;
	upgradeLevel: number;
	maxUpgradeLevel: number;
}

// Monster entity from monster-service
export interface Monster {
	id: number;
	userId: string;
	definitionId: number;
	name: string;
	element: "FEU" | "EAU" | "AIR" | "TERRE";
	pictureUrl: string | null;
	hp: number;
	atk: number;
	def: number;
	vit: number;
	level: number;
	experience: number;
	xpThreshold: number;
	availableSkillPoints: number;
	skills: Skill[];
}

// Response from POST /invocations
export interface SummonResult {
	invocationId: number;
	status: "PENDING" | "COMPLETED" | "FAILED";
	monsterId: number;
	message: string;
	name: string;
	element: string;
	pictureUrl: string | null;
	baseHp: number;
	baseAtk: number;
	baseDef: number;
	baseVit: number;
}
