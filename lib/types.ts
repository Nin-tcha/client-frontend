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
	element: "FEU" | "EAU" | "VENT" | "TERRE";
}

// Monster entity from monster-service
export interface Monster {
	id: number;
	userId: string;
	definitionId: number;
	name: string;
	element: "FEU" | "EAU" | "VENT" | "TERRE";
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
	status: "PENDING" | "PENDING_STAMINA" | "COMPLETED" | "FAILED";
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

export interface LeaderboardEntry {
	username: string;
	elo: number;
	wins: number;
	losses: number;
}

export interface CombatEvent {
	type: "TURN_START" | "SKILL_USE" | "DAMAGE" | "KO" | "VICTORY" | "SKIP";
	message?: string;
	data: Record<string, any>;
	turn?: number;
	actor?: string;
	target?: string;
	actorOwner?: string;
	targetOwner?: string;
}

export interface FightResult {
	winner: string;
	events: CombatEvent[];
}

// Response from POST /fight/start (202 Accepted)
export interface FightStartResponse {
	fightId: number;
	status: string;
	message: string;
}

// Response from GET /fight/{id} (poll endpoint) — mirrors CombatHistory entity
export interface FightStatusResponse {
	id: number;
	playerA: string;
	playerB: string;
	winner: string | null;
	status: "PENDING_STAMINA" | "PROCESSING" | "COMPLETED" | "FAILED";
	failureReason: string | null;
	events: string | null; // JSON string of CombatEvent[]
	seed: number;
	foughtAt: string;
	playerAEloAfter: number;
	playerBEloAfter: number;
	monsterAId: number | null;
	monsterBId: number | null;
}

export interface CombatHistoryEntry {
	id: number;
	playerA: string;
	playerB: string;
	winner: string;
	seed: number;
	foughtAt: string;
	playerAEloAfter: number;
	playerBEloAfter: number;
	monsterAId: number;
	monsterBId: number;
}

export interface ReplayResponse {
	original: CombatHistoryEntry;
	replay: FightResult;
	monsterA: Monster;
	monsterB: Monster;
}

// Stamina status from stamina-service
export interface StaminaStatus {
	username: string;
	currentStamina: number;
	maxStamina: number;
	lastRegenTime: string;
	nextClaimAt: string | null;
	canClaim: boolean;
}

// Response from GET /invocations/{id} (poll endpoint) — mirrors Invocation entity
export interface InvocationStatusResponse {
	id: number;
	userId: string;
	createdAt: string;
	status: "PENDING_STAMINA" | "PENDING" | "COMPLETED" | "FAILED";
	monsterId: number | null;
}
