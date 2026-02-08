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

## Design System

Visit `/design-system` to see all available UI components with interactive examples.

### Available Components

- **Button** - Multiple variants (default, outline, secondary, ghost, destructive, link) and sizes
- **Badge** - Status indicators and labels
- **Card** - Content containers with header, content, and footer
- **Alert Dialog** - Modal dialogs for confirmations
- **Dropdown Menu** - Contextual menus with items, checkboxes, and radio groups
- **Select** - Single-value selection from options
- **Combobox** - Searchable autocomplete selection
- **Input / Textarea** - Text input fields
- **Field / Label** - Form field wrappers

## Related Services

This frontend connects to the Nintcha microservices backend:

- `auth-service` - Authentication & authorization
- `player-service` - Player profiles & inventories
- `monster-service` - Monster data & management
- `invocation-service` - Gacha/summoning system
- `combat-service` - PvP combat logic
