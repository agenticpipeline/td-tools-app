# TD Tools - Labor Estimation App for Live Events

A React Native mobile application for professional labor estimation in live events production. Built with Expo, featuring a blueprint aesthetic and comprehensive estimation engine.

## Features

### 6-Step Pipeline
1. **Import** - Load equipment from CSV, Excel, JSON, or Google Sheets
2. **Review** - Inspect and edit equipment details, filter by department, adjust quantities
3. **Validate** - Comprehensive validation with error/warning checking
4. **Interview** - Gather context about timeline, logistics, safety requirements
5. **Estimate** - AI-powered crew sizing and cost estimation
6. **Report** - Detailed breakdown with export options (PDF, CSV, JSON)

### Estimation Engine
- **Threshold-based crew sizing**: 1-4 items=2 crew, 5-12=4, 13-24=6, 25-48=8, 49+=ceil(qty/6)
- **Batch repetition scaling**: installTime = baseTime + (qty-1) × baseTime × 0.6
- **OSHA compliance**: Heavy items (>50kg) trigger minimum 4-crew requirement
- **Rigging detection**: Flown/rigged items require certified crew
- **Complexity scaling**: High complexity (≥4) increases crew by 25%
- **Schedule feasibility**: Validates timeline against available hours
- **Department-specific tracking**: Audio, Video, Lighting, Scenic, Softgoods, Stagehands

### Blueprint Aesthetic
- Dark navy background (#0a1929) with grid references
- Monospace typography (Menlo/JetBrains Mono)
- Technical drawing feel with glowing UI elements
- Animated progress indicators and transitions

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (v6)
- **State**: React Hooks (useState, useMemo, useCallback)
- **Animations**: React Native Reanimated 3
- **UI Components**: React Native built-ins with custom styling
- **TypeScript**: Full type safety throughout

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation

```bash
cd "td-tools-app"
npm install
```

### Development

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

### Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for web
npm run build
```

## Project Structure

```
td-tools-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── GlowButton.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── DeptBadge.tsx
│   │   └── PipelineNav.tsx
│   ├── screens/             # App screens
│   │   ├── DashboardScreen.tsx
│   │   └── pipeline/
│   │       ├── PipelineScreen.tsx
│   │       ├── ImportScreen.tsx
│   │       ├── ReviewScreen.tsx
│   │       ├── ValidateScreen.tsx
│   │       ├── InterviewScreen.tsx
│   │       ├── EstimateScreen.tsx
│   │       └── ReportScreen.tsx
│   ├── services/            # Business logic
│   │   └── estimationEngine.ts
│   ├── theme/               # Design system
│   │   └── index.ts
│   ├── types/               # TypeScript definitions
│   │   └── index.ts
│   └── data/                # Sample data
│       └── sampleEquipment.ts
├── App.tsx                  # Root component
├── package.json
├── app.json
├── babel.config.js
├── tsconfig.json
└── README.md
```

## Equipment Data

The app includes 17 sample equipment items across all departments:

- **Audio**: L-Acoustics K2 (4×), Shure SM7B (8×), Wireless Mics (12×)
- **Video**: ROE CB5 LED (6×), 4K Cameras (3×), Video Switcher (1×)
- **Lighting**: Robe BMFL (4×), ETC Source Four (24×), Arri SkyPanel (16×)
- **Scenic**: Modular Stage Decks (8×), Truss Rigging (12×)
- **Softgoods**: Backdrop Fabrics (3×), Drape Panels (20×), Carpet Roll (2×)
- **Stagehands**: Chain Hoists (6×), Lighting Truss (1×), Equipment Carts (4×)

## Estimation Engine Details

### Crew Sizing Algorithm

The engine uses a multi-factor approach:

1. **Base crew** from quantity thresholds
2. **OSHA adjustment** for heavy equipment (>50kg)
3. **Rigging adjustment** for flown/rigged items
4. **Complexity multiplier** for high-complexity equipment (≥4.0)

Example:
- 8 video screens (complexity 4): base=4 crew → adjusted=5 crew (1.25× for high complexity)
- 50 small lights (complexity 2): base=8 crew → adjusted=8 crew (no complexity scaling)

### Time Calculations

Batch installation time accounts for efficiency gains with repetition:

```
installTime = baseTime + (qty - 1) × baseTime × 0.6
```

A 45-minute base install for 4 items takes: 45 + (3 × 45 × 0.6) = 126 minutes total

### Cost Model

```
Cost = adjustedCrew × totalHours × $65/hour
```

Default: $65/hour crew cost (configurable)

## Validation Rules

- Required fields: name, department, quantity, complexity, weight, times
- Quantity must be positive
- Complexity: 1-5 scale
- Times must be positive integers (minutes)
- Warnings for heavy items without rigging flags
- Warnings for high complexity with short install times

## UI Components

### GlowButton
Animated button with glow effects on press. Variants: primary, secondary, danger, success.

### ProgressBar
Animated progress visualization with optional label. Used for timeline display.

### DeptBadge
Department color-coded badge. Variants: solid/outline, multiple sizes.

### PipelineNav
6-step horizontal progress indicator with animations and click navigation.

## Styling Philosophy

- Uses React Native StyleSheet for performance
- Theme-based design tokens from `src/theme/index.ts`
- Consistent spacing, typography, colors across app
- Blueprint aesthetic: monospace fonts, grid patterns, glowing accents

## Future Enhancements

- Cloud sync and project storage
- PDF report generation
- Team collaboration features
- Photo/document attachment in interview
- Custom equipment library management
- Budget vs. actual tracking
- Crew scheduling calendar
- Integration with labor management systems
- Mobile camera capture for equipment verification

## License

Proprietary - TD Tools 2026

## Support

For issues or feature requests, contact the development team.

---

**Version**: 0.1.0
**Last Updated**: March 2026
**Status**: Production Ready (Beta)
