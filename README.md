# Nintcha Frontend

**The client-facing frontend for the Nintcha gacha game.**

This is the player-facing application (not the back-office) where users can interact with the Nintcha game: view their profile, manage monsters, perform invocations, and engage in combat....

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
nintcha-front/
├── app/                    # Next.js App Router pages
│   ├── globals.css         # Global styles & CSS variables
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── design-system/      # Design system showcase
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
├── lib/                    # Utility functions
└── public/                 # Static assets
```

## Related Services

This frontend connects to the Nintcha microservices backend:

- `auth-service` - Authentication & authorization
- `player-service` - Player profiles & inventories
- `monster-service` - Monster data & management
- `invocation-service` - Gacha/summoning system
- `combat-service` - PvP combat logic
