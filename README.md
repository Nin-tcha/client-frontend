# Nintcha Frontend

Interface joueur du jeu gacha Nintcha. Les joueurs peuvent invoquer des monstres, constituer une équipe et les faire combattre en PvP.

## Sommaire

1. [Stack technique](#1-stack-technique)
2. [Démarrage rapide](#2-démarrage-rapide)
3. [Le pattern Server Actions](#3-le-pattern-server-actions)
4. [Authentification](#4-authentification)
5. [Routes](#5-routes)
6. [Le pattern de polling](#6-le-pattern-de-polling)
7. [La battle scene — useReducer event-driven](#7-la-battle-scene--usereducer-event-driven)

---

## 1. Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript |
| Composants UI | shadcn/ui (thème pixel-art, radii supprimés) |
| Style | Tailwind CSS + CSS custom, police `Press Start 2P` |
| State global | React Context (`AuthProvider`) |
| Formulaires | React 19 `useActionState` + Server Actions |

**Thème visuel** : pixel-art strict — bordures 2px noires, ombres 4px sans blur, zéro `border-radius`, palette oklch.

---

## 2. Démarrage rapide

```bash
# Copier les variables d'environnement
cp .env.local.example .env.local

# Installer les dépendances
npm install

# Démarrer le serveur de développement (port 3000)
npm run dev

# Build de production
npm run build && npm start

# Lint
npm run lint
```

Variables d'environnement requises dans `.env.local` :

```
AUTH_API_URL=http://localhost:8081
PLAYER_API_URL=http://localhost:8082
MONSTER_API_URL=http://localhost:8083
INVOCATION_API_URL=http://localhost:8084
FIGHT_API_URL=http://localhost:8085
```

Toutes ces variables sont **server-only** (pas de préfixe `NEXT_PUBLIC_`). Elles ne sont jamais exposées au navigateur.

---

## 3. Le pattern Server Actions

### Pourquoi pas une SPA classique ?

Dans une SPA classique (React + Vite, Create React App…), le navigateur appelle directement les API backend :

```
Navigateur  →  https://api.nintcha.com/invocations  (appel fetch depuis le JS du browser)
```

Cela implique :
- Les URLs des services sont dans le bundle JS, visibles par n'importe quel utilisateur
- Le token d'auth transite dans des headers lisibles côté client
- CORS doit être configuré sur chaque service

Dans Nintcha, **tous les appels backend passent par le serveur Next.js** :

```
Navigateur  →  Serveur Next.js  →  Services Java (réseau interne)
```

Le navigateur n'a jamais connaissance des URLs des microservices.

### Comment c'est implémenté

Deux mécanismes sont utilisés selon le besoin.

**Server Components (lecture)** : les pages qui n'ont pas besoin d'interactivité peuvent appeler `lib/api.ts` directement dans leur corps de composant. Next.js exécute ce code sur le serveur.

**Server Actions (mutations)** : pour les formulaires et les opérations qui modifient des données, on utilise la directive `"use server"`. Ces fonctions sont déclarées dans des fichiers `actions.ts` co-localisés avec leur route.

```
app/(authenticated)/
  summon/
    page.tsx        ← "use client" — UI interactive
    actions.ts      ← "use server" — logique métier + appels API
```

Exemple dans `summon/actions.ts` :

```ts
"use server";

import { getInvocationStatus, getMonster, summon } from "@/lib/api";

export async function summonAction(
  _prevState: SummonState,
  _formData: FormData
): Promise<SummonState> {
  const result = await summon();          // appel vers invocation-service
  const { invocationId } = result.data;
  // polling côté serveur...
  const monsterRes = await getMonster(invocation.monsterId); // appel vers monster-service
  return { success: true, result: { ... } };
}
```

Côté composant client, on branche l'action sur un formulaire avec `useActionState` (React 19) :

```ts
// summon/page.tsx
"use client";

const [state, formAction, isPending] = useActionState<SummonState, FormData>(
  summonAction,
  null
);

// Le formulaire soumet vers le serveur, pas vers une API externe
<form action={handleSubmit}>
  <Button type="submit" disabled={isPending}>Invoke Monster</Button>
</form>
```

`isPending` passe à `true` automatiquement pendant l'exécution de l'action. `state` contient le résultat une fois l'action terminée.

### Centralisation des appels dans `lib/api.ts`

Toutes les fonctions d'appel aux microservices sont dans `lib/api.ts`. Ce fichier commence par `"use server"` et importe `authFetch` de `lib/auth.ts`. Aucun composant ne construit d'URL de microservice directement.

```ts
// lib/api.ts — "use server"
const INVOCATION_API_URL = process.env.INVOCATION_API_URL || "http://localhost:8084";

export async function summon() {
  const response = await authFetch(`${INVOCATION_API_URL}/invocations`, { method: "POST" });
  // ...
}
```

---

## 4. Authentification

### Vue d'ensemble

```
[Browser]  →  cookie HttpOnly "nintcha_token"  →  [Next.js server]  →  Authorization header  →  [Java services]
```

Le token n'est jamais lisible par le JavaScript du navigateur (cookie `httpOnly`).

### Le middleware (`proxy.ts`)

`proxy.ts` est le fichier de middleware Next.js (renommé de `middleware.ts` à partir de Next.js 16). Il s'exécute sur chaque requête, avant le rendu de la page.

```ts
// proxy.ts
const protectedRoutes = ["/collection", "/summon", "/fight"];
const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("nintcha_token")?.value;

  // Pas connecté → redirect vers /login (avec ?from= pour reprendre la navigation)
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté → redirect vers /collection (évite d'afficher /login inutilement)
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/collection", request.url));
  }

  // / → redirect automatique selon l'état de connexion
}
```

Le middleware ne valide pas le token cryptographiquement — il vérifie seulement la présence du cookie. La validation réelle est faite par `validateSession()` dans `AuthProvider`.

### `authFetch` — authentification des requêtes serveur

```ts
// lib/auth.ts — "use server"
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getToken();   // lit le cookie nintcha_token côté serveur

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", token);  // le token AES est envoyé tel quel
  }
  headers.set("Content-Type", "application/json");

  return fetch(url, { ...options, headers });
}
```

Les services Java reçoivent le token dans le header `Authorization` et appellent `auth-service` pour le valider. Chaque validation étend aussi la durée de vie du token de +1 heure.

### `AuthProvider` — état global d'authentification

`AuthProvider` est un Context React qui enveloppe toute l'application (dans `layout.tsx`). Il expose :

```ts
interface AuthContextType {
  session: AuthSession | null;   // { username, role, token }
  profile: PlayerProfile | null; // { level, monsterCount, inventoryLimit }
  stamina: StaminaStatus | null; // { currentStamina, maxStamina, canClaim, ... }
  isLoading: boolean;
  refresh: () => Promise<void>;         // recharge session + profil + stamina
  refreshStamina: () => Promise<void>;  // recharge seulement la stamina
  claimStamina: () => Promise<{ success: boolean; error?: string }>;
}
```

`AuthProvider` appelle `validateSession()` (Server Action) au chargement et à chaque changement de route. Il évite un spinner inutile lors des rechargements en arrière-plan : le spinner n'apparaît que si aucune session n'est encore connue.

Pour consommer le contexte dans n'importe quel composant client :

```ts
const { session, profile, stamina, refresh } = useAuth();
```

### Cycle de vie du cookie

| Événement | Action |
|---|---|
| `login()` | `setToken(token)` — HttpOnly, sameSite: lax, maxAge 1h |
| `logout()` | `clearToken()` — supprime le cookie |
| `validateSession()` | Si le token est invalide, `clearToken()` automatiquement |
| Chaque appel API | Le backend prolonge le token de +1h |

---

## 5. Routes

Structure des dossiers (`app/`) :

```
app/
  (authenticated)/     # groupe de routes — toutes protégées par proxy.ts
    collection/        # inventaire de monstres + modal de détail
    summon/            # invocation gacha
    combat/            # combat PvP
  login/               # page publique
  register/            # page publique
  design-system/       # vitrine des composants UI
  layout.tsx           # layout racine (wrap AuthProvider + police)
proxy.ts               # middleware Next.js
```

| Route | Accès | Rôle |
|---|---|---|
| `/login` | Public | Formulaire de connexion |
| `/register` | Public | Formulaire d'inscription |
| `/collection` | Authentifié | Inventaire des monstres du joueur, modal détail/upgrade |
| `/summon` | Authentifié | Invocation gacha (coût : 20 stamina) |
| `/combat` | Authentifié | Sélection d'équipe, matchmaking, combat, historique, replay |
| `/design-system` | Public | Vitrine des composants pixel-art |
| `/` | — | Redirect automatique vers `/collection` ou `/login` |

Le groupe `(authenticated)/` est un **route group** Next.js (les parenthèses n'apparaissent pas dans l'URL). Il n'ajoute pas de layout spécifique ici — la protection est entièrement gérée par `proxy.ts`.

---

## 6. Le pattern de polling

### Pourquoi les opérations sont asynchrones

L'invocation et le combat sont des opérations **asynchrones côté backend**. Quand un joueur lance une invocation :

1. `POST /invocations` retourne immédiatement **202 Accepted** avec un `invocationId`
2. En coulisse, Kafka orchestre : invocation-service → stamina-service (déduction) → monster-service (création du monstre)
3. La chaîne peut prendre entre 200 ms et quelques secondes

Le frontend ne peut pas attendre une réponse synchrone — il doit **poller** le statut.

### Polling dans une Server Action (`summon/actions.ts`)

Pour l'invocation, le polling se fait **entièrement côté serveur** dans la Server Action. Le navigateur ne voit qu'une action en cours (`isPending = true`) jusqu'au résultat final :

```ts
// summon/actions.ts — "use server"
const POLL_INTERVAL = 1000; // ms
const MAX_POLL_ATTEMPTS = 30;

export async function summonAction(_prevState, _formData): Promise<SummonState> {
  // Étape 1 : déclencher l'invocation
  const { invocationId } = (await summon()).data;

  // Étape 2 : poller jusqu'à COMPLETED ou FAILED
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL);

    const { data: invocation } = await getInvocationStatus(invocationId);

    if (invocation.status === "COMPLETED") {
      const monster = await getMonster(invocation.monsterId);
      return { success: true, result: { /* détails du monstre */ } };
    }

    if (invocation.status === "FAILED") {
      return { success: false, error: "Summon failed — stamina insuffisante." };
    }
    // statuts PENDING_STAMINA / PENDING → continuer
  }

  return { success: false, error: "Timeout — vérifiez votre collection." };
}
```

Les états intermédiaires du statut d'invocation sont :

```
PENDING_STAMINA  →  (stamina déduite)  →  PENDING  →  (monstre créé)  →  COMPLETED
                                                                        ↘  FAILED
```

### Polling côté client (`combat/page.tsx`)

Pour le combat, le polling se fait **côté client** avec `setTimeout` car l'utilisateur doit voir un écran d'attente interactif (il peut annuler) :

```ts
// combat/page.tsx — "use client"
const POLL_INTERVAL = 1000;
const MAX_POLL_ATTEMPTS = 60;

const pollFight = useCallback(async (fightId: number) => {
  pollCountRef.current++;
  if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
    setFightError("Fight timed out.");
    return;
  }

  const { data: fight } = await getFightStatus(fightId);

  if (fight.status === "COMPLETED") {
    const events = JSON.parse(fight.events);  // CombatEvent[]
    setFightResult({ winner: fight.winner, events });
    return;
  }

  if (fight.status === "FAILED") {
    setFightError(fight.failureReason);
    return;
  }

  // Toujours en cours → recommencer dans 1s
  pollTimerRef.current = setTimeout(() => pollFightRef.current?.(fightId), POLL_INTERVAL);
}, []);
```

`pollTimerRef` est nettoyé sur unmount pour éviter les fuites mémoire. Un `ref` est utilisé pour l'auto-référence de la fonction de polling (évite le problème de stale closure avec `useCallback`).

Les états intermédiaires du statut de combat :

```
PENDING_STAMINA  →  (stamina déduite)  →  PROCESSING  →  (bataille calculée)  →  COMPLETED
                                                                                ↘  FAILED
```

---

## 7. La battle scene — useReducer event-driven

### Le problème

Le backend calcule le combat de façon déterministe (seed fixe) et retourne **la liste complète des événements** en une seule réponse JSON :

```json
[
  { "type": "TURN_START", "turn": 1 },
  { "type": "SKILL_USE", "actor": "Igniflame", "actorOwner": "alice", "data": { "skillElement": "FEU" } },
  { "type": "DAMAGE", "target": "Aquarix", "targetOwner": "bob", "data": { "hpAfter": 45, "effectiveness": "STRONG" } },
  { "type": "KO", "target": "Aquarix" },
  { "type": "VICTORY", "data": { "winner": "alice" } }
]
```

L'UI doit rejouer ces événements **un par un**, avec une pause entre chaque, pour créer une animation de combat.

### Architecture : reducer + useEffect temporisé

La battle scene (`combat/battle-scene/index.tsx`) utilise `useReducer` pour gérer l'état complet de l'animation. Le reducer est une **fonction pure** qui décrit comment chaque type d'événement transforme l'état visuel :

```ts
type BattleAction =
  | { type: "PROCESS_EVENT"; event: CombatEvent; myUsername?: string }
  | { type: "ADVANCE" }          // passe à l'événement suivant
  | { type: "FINISH"; winner: string }
  | { type: "SKIP"; events: CombatEvent[] };  // saute toute l'animation

interface BattleState {
  eventIndex: number;
  dialogue: string;           // texte affiché dans la boîte de dialogue
  myFighter: FighterState;    // { name, currentHp, maxHp, animation: "idle"|"attacking"|"hit"|"dying" }
  oppFighter: FighterState;
  stepDelay: number;          // durée (ms) avant de passer au prochain événement
  isFinished: boolean;
  // ...
}
```

Le flux de lecture est piloté par deux `useEffect` :

```
useEffect [eventIndex]
  → dispatch(PROCESS_EVENT)        // mise à jour immédiate de l'état visuel
      → reducer retourne nouveau stepDelay (ex: 2000ms pour un KO)

useEffect [eventIndex, stepDelay]
  → setTimeout(() => dispatch(ADVANCE), stepDelay / playbackSpeed)
      → eventIndex + 1 → recommence
```

Schéma du cycle :

```
eventIndex = N
    │
    ├─ useEffect → PROCESS_EVENT(events[N])
    │       reducer :  dialogue = "Igniflame attacks!"
    │                  myFighter.animation = "attacking"
    │                  stepDelay = 1500
    │
    └─ useEffect → setTimeout(1500ms) → ADVANCE
                         eventIndex = N+1 → boucle
```

### Pourquoi useReducer plutôt que useState ?

Chaque événement de combat peut modifier simultanément plusieurs morceaux d'état : la barre de vie, le texte du dialogue, l'animation du sprite, l'indicateur d'élément, le délai de la prochaine étape. Avec `useState` séparé pour chaque valeur, les mises à jour seraient fractionnées sur plusieurs renders. Avec `useReducer`, toutes les mises à jour liées à un même événement se font en **une seule transition d'état atomique**.

### La fonction `SKIP`

Le bouton "Skip Animation" calcule l'état final directement en appliquant tous les événements de dommages en séquence, sans attendre les timers :

```ts
case "SKIP": {
  // Rejouer tous les événements en mémoire pour calculer l'état final
  action.events.forEach((e) => {
    if (e.type === "DAMAGE") myHp = e.data.hpAfter;
    if (e.type === "KO") { /* mettre hp à 0 */ }
    if (e.type === "MONSTER_ENTERED") { /* changer le fighter affiché */ }
  });
  return { ...state, eventIndex: action.events.length, myFighter: { currentHp: myHp, animation: myHp === 0 ? "dying" : "idle", ... } };
}
```

### Replay déterministe

La fonctionnalité de replay (`POST /fight/replay/{historyId}`) utilise exactement le même composant `BattleScene`. Le backend recalcule le combat à partir du seed stocké et retourne la même liste d'événements. L'UI reçoit `FightResult` et le rejoue de la même façon, que ce soit un combat en direct ou un replay.
