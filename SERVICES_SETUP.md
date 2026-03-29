# TD Tools Services Layer Setup Guide

## Installation

### 1. Update package.json

Add the required dependency to your `package.json`:

```bash
npm install axios
# or
yarn add axios
```

The services layer uses axios for HTTP requests. Update your `package.json` dependencies:

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "expo": "^51.0.0",
    "react": "^18.2.0",
    "react-native": "^0.74.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

### 2. Environment Variables

Create a `.env` file in your project root:

```bash
# .env
REACT_APP_API_URL=http://localhost:3001/api/v1

# For NUC connectivity
# REACT_APP_API_URL=http://agent-nuc.tail[net-domain]:3001/api/v1
```

In React Native (Expo), you may need to handle environment variables differently:

```typescript
// config/api.ts
import { Platform } from 'react-native';

const API_URL = __DEV__
  ? 'http://10.0.2.2:3001/api/v1'  // Android emulator
  : 'http://localhost:3001/api/v1'; // iOS simulator or physical device

export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 30000,
  retryAttempts: 3,
};
```

### 3. Initialize API Client

In your app entry point, configure the API client:

```typescript
// App.tsx
import { apiClient } from './services/api';

export default function App() {
  // Initialize on app start
  React.useEffect(() => {
    // Set auth token if available
    const token = getStoredAuthToken();
    if (token) {
      apiClient.setAuthToken(token);
    }

    // Configure for NUC if needed
    // apiClient.setBaseURL('http://agent-nuc.tail[net-domain]:3001/api/v1');
  }, []);

  return (
    <NavigationContainer>
      {/* Your app */}
    </NavigationContainer>
  );
}
```

## Architecture Overview

The services layer is organized into three main modules:

### API Module (`src/services/api/`)

Provides Axios-based HTTP client and endpoint functions:

- **client.ts**: Core HTTP client with retry logic, interceptors, error handling
- **types.ts**: TypeScript DTOs and response wrappers
- **projects.ts**: Project CRUD operations
- **equipment.ts**: Equipment management and file parsing
- **estimates.ts**: Estimate calculations and report generation
- **index.ts**: Centralized exports

**Key Features:**
- Automatic retry with exponential backoff
- Request/response interceptors for auth tokens
- Typed error responses with custom error classes
- File upload with progress tracking
- File download for exports
- Request tracking with unique IDs

### Hooks Module (`src/services/hooks/`)

React hooks for managing API state and mutations:

- **useProjects.ts**: List, fetch, create, update, delete projects
- **useEquipment.ts**: Equipment list, file parsing, validation
- **useEstimate.ts**: Estimate calculation, fetching, export, history
- **index.ts**: Centralized exports

**Key Features:**
- Loading, error, and data states
- Automatic refetch and pagination
- File upload progress tracking
- Validation with progress indication
- Combined CRUD hooks for complex workflows

### Offline Module (`src/services/offline/`)

Offline-first utilities and caching:

- **cache.ts**: Caching service, offline queue, network detection
- **index.ts**: Exports

**Key Features:**
- TTL-based cache with automatic expiration
- Offline operation queue for syncing when online
- Network status detection and subscriptions
- In-memory fallback for React Native

## Usage Examples

### Basic Project Management

```typescript
import { useProjects, useCreateProject } from './services/hooks';

function ProjectsScreen() {
  const { projects, loading, error, nextPage, hasMore } = useProjects();
  const { create } = useCreateProject();

  return (
    <View>
      {projects.map((project) => (
        <Text key={project.id}>{project.name}</Text>
      ))}
      {hasMore && <Button onPress={nextPage}>Load More</Button>}
    </View>
  );
}
```

### Equipment Upload and Validation

```typescript
import { useParseFile, useValidateSpecs } from './services/hooks';

function EquipmentSetup({ projectId }) {
  const { parseFile, progress, result } = useParseFile(projectId);
  const { validate, progress: validateProgress } = useValidateSpecs(projectId);

  const handleFileSelect = async (file) => {
    const parseResult = await parseFile(file);
    console.log(`Imported: ${parseResult.imported}`);

    // Validate after import
    await validate();
  };

  return (
    <View>
      {progress && <ProgressBar value={progress.percent} />}
      {validateProgress > 0 && <ProgressBar value={validateProgress} />}
    </View>
  );
}
```

### Estimate Calculation and Export

```typescript
import { useEstimate, useCalculateEstimate, useExportReport } from './services/hooks';

function EstimateScreen({ projectId }) {
  const { estimate } = useEstimate(projectId);
  const { calculate } = useCalculateEstimate(projectId);
  const { downloadAndSave } = useExportReport(projectId);

  const handleCalculate = async (params) => {
    const est = await calculate(params);
    console.log(`Total Cost: $${est.totalCost}`);
  };

  const handleExport = async () => {
    await downloadAndSave({
      format: 'pdf',
      includeEquipment: true,
      includeEstimate: true,
    });
  };

  return (
    <View>
      <EstimateForm onCalculate={handleCalculate} />
      {estimate && <EstimateDisplay estimate={estimate} />}
      <Button onPress={handleExport}>Export PDF</Button>
    </View>
  );
}
```

### Offline Support

```typescript
import {
  cacheService,
  offlineQueueService,
  networkStatusService
} from './services/offline';

function useOfflineProjects() {
  const [projects, setProjects] = React.useState([]);
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkStatusService.subscribe((status) => {
      setIsOnline(status.isOnline);

      if (status.isOnline) {
        // Sync offline queue
        syncOfflineQueue();
      }
    });

    // Load from cache
    const cached = cacheService.get('projects');
    if (cached) {
      setProjects(cached);
    }

    return unsubscribe;
  }, []);

  const syncOfflineQueue = () => {
    const queue = offlineQueueService.getQueue();
    queue.forEach(async (op) => {
      try {
        // Handle operation sync
        await syncOperation(op);
        offlineQueueService.remove(op.id);
      } catch (error) {
        offlineQueueService.incrementRetry(op.id);
      }
    });
  };

  return { projects, isOnline };
}
```

## Error Handling

```typescript
import {
  NotFoundError,
  ValidationError,
  RateLimitError,
  NetworkError,
} from './services/api';

function useProjectDetail(projectId) {
  const [project, setProject] = React.useState(null);
  const [error, setError] = React.useState(null);

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.data);
    } catch (err) {
      if (err instanceof NotFoundError) {
        setError('Project not found');
      } else if (err instanceof ValidationError) {
        setError(`Invalid: ${JSON.stringify(err.details)}`);
      } else if (err instanceof RateLimitError) {
        setError(`Rate limited, retry in ${err.retryAfter}s`);
      } else if (err instanceof NetworkError) {
        setError('Network connection error');
      }
    }
  };

  return { project, error, refetch: fetchProject };
}
```

## TypeScript Configuration

Ensure your `tsconfig.json` includes proper paths for imports:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-native",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing

Mock the API client for unit tests:

```typescript
import { ApiClient } from './services/api';

describe('Projects', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({
      baseURL: 'http://localhost:3001/api/v1',
      timeout: 5000,
      retryAttempts: 1,
    });
  });

  test('should fetch projects', async () => {
    const response = await client.get('/projects');
    expect(response.success).toBe(true);
  });
});
```

## Debugging

The API client includes request tracking. Check browser console network tab for:

- `X-Request-ID`: Unique request identifier
- `X-Request-Time`: Request timestamp
- `X-API-Version`: API version

Enable detailed logging:

```typescript
const response = await apiClient.get('/projects');
console.log({
  requestId: response.headers['x-request-id'],
  timestamp: response.headers['x-request-time'],
  status: response.status,
});
```

## Production Deployment

### NUC Connectivity

For connecting to the Intel NUC backend:

```typescript
// Set at runtime based on environment
const NUC_URL = 'http://agent-nuc.tail[net-domain]:3001/api/v1';
apiClient.setBaseURL(NUC_URL);

// Or use environment variable
// REACT_APP_API_URL=http://agent-nuc.tail[net-domain]:3001/api/v1
```

### Security

- Store auth tokens securely (use React Native's SecureStore in production)
- Enable HTTPS in production (update base URL to https://)
- Implement token refresh logic for expired tokens
- Use secure connection to NUC (VPN, TailScale, etc.)

### Performance

- Implement cache invalidation strategy
- Use pagination for large lists
- Consider request debouncing for search
- Monitor offline queue size in production

## File Structure

```
src/services/
├── api/
│   ├── client.ts          # HTTP client
│   ├── types.ts           # TypeScript definitions
│   ├── projects.ts        # Project endpoints
│   ├── equipment.ts       # Equipment endpoints
│   ├── estimates.ts       # Estimate endpoints
│   └── index.ts          # Exports
├── hooks/
│   ├── useProjects.ts     # Project hooks
│   ├── useEquipment.ts    # Equipment hooks
│   ├── useEstimate.ts     # Estimate hooks
│   └── index.ts          # Exports
├── offline/
│   ├── cache.ts          # Caching & offline support
│   └── index.ts          # Exports
├── index.ts              # Main exports
└── README.md             # Full documentation
```

## Next Steps

1. Install axios: `npm install axios`
2. Set up environment variables
3. Initialize API client in App.tsx
4. Start using hooks in your components
5. Read full documentation in `src/services/README.md`

## Support

For issues or questions, refer to:
- `src/services/README.md` - Comprehensive API documentation
- Individual hook/API module comments - Detailed function documentation
- `src/services/api/types.ts` - Type definitions and interfaces

---

Created: 2026-03-28
Last Updated: 2026-03-28
