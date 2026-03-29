# TD Tools Services Layer - Quick Start

Get started with the API client and React hooks in 5 minutes.

## 1. Install Dependencies

```bash
npm install axios
```

## 2. Configure API Client

Set your API URL in `.env`:

```bash
# .env
REACT_APP_API_URL=http://localhost:3001/api/v1

# Or for NUC:
# REACT_APP_API_URL=http://agent-nuc.tail[net-domain]:3001/api/v1
```

## 3. Initialize in Your App

```typescript
// App.tsx
import { apiClient } from './services/api';
import React from 'react';

export default function App() {
  React.useEffect(() => {
    // Set auth token if you have one
    const token = getAuthToken(); // implement this
    if (token) {
      apiClient.setAuthToken(token);
    }
  }, []);

  return (
    // Your app content
  );
}
```

## 4. Use Hooks in Components

### List Projects

```typescript
import { useProjects } from './services/hooks';

export function ProjectsScreen() {
  const { projects, loading, error, nextPage, hasMore } = useProjects();

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {projects.map((p) => (
        <Text key={p.id}>{p.name}</Text>
      ))}
      {hasMore && <Button onPress={nextPage}>Load More</Button>}
    </View>
  );
}
```

### Create Project

```typescript
import { useCreateProject } from './services/hooks';

export function CreateProjectScreen() {
  const { create, loading, error } = useCreateProject();

  const handleCreate = async (formData) => {
    try {
      const project = await create(formData);
      console.log('Created:', project.id);
      // Navigate to project detail
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return (
    <View>
      <ProjectForm onSubmit={handleCreate} disabled={loading} />
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
    </View>
  );
}
```

### Upload Equipment File

```typescript
import { useParseFile } from './services/hooks';

export function EquipmentImportScreen({ projectId }) {
  const { parseFile, result, loading, progress, error } = useParseFile(projectId);

  const handleSelectFile = async (file: File) => {
    try {
      const parseResult = await parseFile(file);
      console.log(`Imported: ${parseResult.imported} items`);
    } catch (err) {
      console.error('Import failed:', err.message);
    }
  };

  return (
    <View>
      <FilePicker onSelect={handleSelectFile} disabled={loading} />
      {progress && <ProgressBar value={progress.percent} />}
      {result && (
        <Text>
          ✓ Imported {result.imported} items, {result.failed} failed
        </Text>
      )}
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}
    </View>
  );
}
```

### Calculate & Export Estimate

```typescript
import { useCalculateEstimate, useExportReport } from './services/hooks';

export function EstimateScreen({ projectId }) {
  const { calculate, estimate, isCalculating } = useCalculateEstimate(projectId);
  const { downloadAndSave, loading: exporting } = useExportReport(projectId);

  const handleCalculate = async (params) => {
    const result = await calculate(params);
    console.log(`Total: $${result.totalCost}`);
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
      <EstimateForm onSubmit={handleCalculate} disabled={isCalculating} />

      {estimate && (
        <View>
          <Text>Total Cost: ${estimate.totalCost}</Text>
          <Text>Labor Hours: {estimate.laborHours}</Text>
          <Button onPress={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </View>
      )}
    </View>
  );
}
```

## 5. Error Handling

```typescript
import {
  NotFoundError,
  ValidationError,
  RateLimitError,
  NetworkError,
  ApiErrorResponse,
} from './services/api';

async function fetchProjectSafely(projectId: string) {
  try {
    const response = await getProject(projectId);
    return response.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.log('Project not found');
    } else if (error instanceof ValidationError) {
      console.log('Invalid request:', error.details);
    } else if (error instanceof RateLimitError) {
      console.log('Too many requests, retry in:', error.retryAfter, 'seconds');
    } else if (error instanceof NetworkError) {
      console.log('Network error, check your connection');
    } else if (error instanceof ApiErrorResponse) {
      console.log('API error:', error.code, error.message);
    }
  }
}
```

## 6. Offline Support

```typescript
import { networkStatusService, cacheService, offlineQueueService } from './services/offline';

export function useOfflineAware() {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkStatusService.subscribe((status) => {
      console.log('Online:', status.isOnline);
      setIsOnline(status.isOnline);

      // Sync offline queue when back online
      if (status.isOnline) {
        syncOfflineQueue();
      }
    });

    return unsubscribe;
  }, []);

  const syncOfflineQueue = () => {
    const queue = offlineQueueService.getQueue();
    console.log(`Syncing ${queue.length} pending operations`);
    // Handle sync...
  };

  return { isOnline };
}
```

## 7. Direct API Usage (Without Hooks)

```typescript
import { apiClient, listProjects, getProject } from './services/api';

// List projects
const response = await listProjects({ page: 1, limit: 20 });
console.log(response.data?.items);

// Get single project
const project = await getProject('project-123');
console.log(project.data?.name);

// Or use client directly
const response = await apiClient.get('/projects/123');
```

## Common Tasks

### Change API URL at Runtime

```typescript
apiClient.setBaseURL('http://agent-nuc.tail[net-domain]:3001/api/v1');
```

### Get Request Statistics

```typescript
const stats = cacheService.getStats();
console.log(`Cached items: ${stats.size}`);

const queueStats = offlineQueueService.getStats();
console.log(`Pending operations: ${queueStats.pending}`);
```

### Clear Cache

```typescript
// Clear specific cache
cacheService.delete('projects');

// Clear pattern
cacheService.clearMatching(/^projects:/);

// Clear all
cacheService.clear();
```

### Check Network Status

```typescript
const status = networkStatusService.getStatus();
if (status.isOnline) {
  console.log('Connected via:', status.type); // wifi, cellular, etc
}
```

## Complete Example

```typescript
import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import {
  useProjects,
  useCreateProject,
  useProjectCrud,
} from './services/hooks';
import { networkStatusService } from './services/offline';

export function ProjectsApp() {
  const [isOnline, setIsOnline] = React.useState(true);
  const { projects, loading, error, refetch } = useProjects();
  const { create } = useCreateProject();

  React.useEffect(() => {
    const unsubscribe = networkStatusService.subscribe((status) => {
      setIsOnline(status.isOnline);
    });
    return unsubscribe;
  }, []);

  const handleCreateProject = async () => {
    try {
      await create({
        name: 'New Event',
        eventDate: '2026-04-15',
        eventType: 'concert',
      });
      refetch();
    } catch (err) {
      console.error('Failed to create:', err.message);
    }
  };

  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <Text>Online: {isOnline ? '✓' : '✗'}</Text>

        <Button title="Create Project" onPress={handleCreateProject} />
        <Button title="Refresh" onPress={refetch} disabled={loading} />

        {loading && <Text>Loading...</Text>}
        {error && <Text style={{ color: 'red' }}>{error.message}</Text>}

        {projects.map((project) => (
          <View
            key={project.id}
            style={{
              borderWidth: 1,
              padding: 12,
              marginVertical: 8,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {project.name}
            </Text>
            <Text>{project.eventType}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
```

## Need More Help?

- **API Reference:** `src/services/README.md`
- **Setup Guide:** `SERVICES_SETUP.md`
- **Summary:** `SERVICES_SUMMARY.md`
- **Type Definitions:** `src/services/api/types.ts`

## What's Included?

- ✓ 30+ API endpoints
- ✓ 15+ React hooks
- ✓ Automatic retry logic
- ✓ File upload/download
- ✓ Offline support
- ✓ Full TypeScript support
- ✓ Error handling
- ✓ Caching and queueing

## Next: Read the Full Documentation

Once you're familiar with the quick start, read:

1. `src/services/README.md` - Complete API documentation
2. `SERVICES_SETUP.md` - Advanced configuration and deployment

---

Happy coding! The services layer is production-ready and fully tested.
