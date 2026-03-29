# TD Tools Services Layer

Complete API client and service layer for the TD Tools labor estimation app. Provides production-ready patterns for communicating with the Express backend API running on the Intel NUC.

## Architecture

```
src/services/
├── api/                      # API Client & Endpoints
│   ├── client.ts            # Axios-based HTTP client with retry logic
│   ├── types.ts             # TypeScript DTOs and type definitions
│   ├── projects.ts          # Project endpoints
│   ├── equipment.ts         # Equipment & file parsing endpoints
│   ├── estimates.ts         # Estimation & reporting endpoints
│   └── index.ts             # Barrel export
├── hooks/                    # React Hooks
│   ├── useProjects.ts       # Project CRUD hooks
│   ├── useEquipment.ts      # Equipment management hooks
│   ├── useEstimate.ts       # Estimate calculation hooks
│   └── index.ts             # Barrel export
├── offline/                  # Offline-First Services
│   ├── cache.ts             # Cache, queue, and network detection
│   └── index.ts             # Barrel export
└── index.ts                 # Main services export
```

## API Client

### Configuration

```typescript
import { apiClient } from './services/api';

// Default configuration
// baseURL: http://localhost:3001/api/v1
// timeout: 30s
// retryAttempts: 3
// retryDelay: exponential backoff (1s, 2s, 4s)

// Connect to NUC at custom domain
apiClient.setBaseURL('http://agent-nuc.tail[net-domain]:3001/api/v1');
```

### Features

- **Automatic Retry**: Exponential backoff for 408, 429, 5xx errors
- **Request/Response Interceptors**: Auth token injection, request tracking
- **Error Handling**: Typed error classes (ValidationError, NotFoundError, RateLimitError)
- **Request Tracking**: Unique X-Request-ID for debugging
- **File Upload**: FormData support with progress tracking
- **File Download**: Blob response for exports
- **Auth Token Management**: localStorage-based token persistence

### Usage

```typescript
import { apiClient, listProjects, getProject, createProject } from './services/api';

// Set auth token
apiClient.setAuthToken('eyJhbGciOiJIUzI1NiIs...');

// Direct client usage
const response = await apiClient.get<Project>('/projects/123');

// Or use convenience functions
const projects = await listProjects({ page: 1, limit: 20 });
const project = await getProject('project-id-123');
```

## API Endpoints

### Projects

```typescript
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  duplicateProject,
  getProjectStats,
  shareProject,
  unshareProject,
} from './services/api';

// List projects
const response = await listProjects({ page: 1, limit: 20, search: 'concert' });
// Returns: { success, data: { items, page, limit, total, hasMore } }

// Get single project
const response = await getProject('project-123');
// Returns: { success, data: Project }

// Create project
const response = await createProject({
  name: 'Concert Setup',
  eventDate: '2026-04-15',
  eventType: 'concert',
  location: 'Madison Square Garden',
});

// Update project
const response = await updateProject('project-123', {
  status: 'in-progress',
  budget: 50000,
});

// Delete project
const response = await deleteProject('project-123');
```

### Equipment

```typescript
import {
  parseFile,
  getEquipmentList,
  updateEquipmentItem,
  deleteEquipmentItem,
  validateSpecs,
  getPowerRequirements,
  getWeightDistribution,
} from './services/api';

// Parse .vwx, .csv, .tsv equipment files
const response = await parseFile(file, 'project-123', (progress) => {
  console.log(`Uploaded: ${progress.percent}%`);
});
// Returns: { items, imported, failed, errors }

// Get equipment list
const response = await getEquipmentList('project-123');
// Returns: Equipment[]

// Update equipment
const response = await updateEquipmentItem('project-123', 'item-456', {
  quantity: 4,
  specs: { power: 2000 },
});

// Validate all equipment specs
const response = await validateSpecs('project-123');
// Returns: { valid, errors, warnings }

// Get power requirements
const response = await getPowerRequirements('project-123');
// Returns: { totalPower, byCategory, overLoadPercentage }

// Get weight distribution
const response = await getWeightDistribution('project-123');
// Returns: { totalWeight, byCategory, centerOfGravity }
```

### Estimates

```typescript
import {
  calculateEstimate,
  getEstimate,
  recalculateEstimate,
  getEstimateHistory,
  exportReport,
  generatePdfReport,
  generateCsvReport,
  generateXlsxReport,
} from './services/api';

// Calculate estimate
const response = await calculateEstimate('project-123', {
  eventDate: '2026-04-15',
  eventType: 'concert',
  duration: 12,
  teamSize: 8,
  complexity: 'high',
  specialRequirements: ['weather-protection', 'overtime'],
});
// Returns: EstimateData with cost breakdown

// Get current estimate
const response = await getEstimate('project-123');
// Returns: EstimateData

// Recalculate with new params
const response = await recalculateEstimate('project-123', {
  teamSize: 10,
  complexity: 'medium',
});

// Export to PDF/CSV/XLSX
const response = await exportReport('project-123', {
  format: 'pdf',
  includeEquipment: true,
  includeEstimate: true,
});
// Returns: ExportResult with download URL

// Convenience functions
const pdfBlob = await generatePdfReport('project-123');
const csvBlob = await generateCsvReport('project-123');
const xlsxBlob = await generateXlsxReport('project-123');
```

## React Hooks

### useProjects()

```typescript
import { useProjects } from './services/hooks';

function ProjectList() {
  const {
    projects,
    page,
    limit,
    total,
    hasMore,
    loading,
    error,
    refetch,
    nextPage,
    prevPage,
    goToPage,
  } = useProjects({ page: 1, limit: 20 });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View>
      {projects.map((p) => (
        <Text key={p.id}>{p.name}</Text>
      ))}
      <Button onPress={nextPage} disabled={!hasMore}>
        Next Page
      </Button>
    </View>
  );
}
```

### useProject(id)

```typescript
import { useProject } from './services/hooks';

function ProjectDetail({ projectId }) {
  const { project, loading, error, refetch } = useProject(projectId);

  return (
    <View>
      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {project && <Text>{project.name}</Text>}
      <Button onPress={refetch}>Refresh</Button>
    </View>
  );
}
```

### useCreateProject()

```typescript
import { useCreateProject } from './services/hooks';

function CreateProjectForm() {
  const { create, loading, error, data } = useCreateProject();

  const handleSubmit = async (formData) => {
    try {
      const project = await create(formData);
      console.log('Project created:', project.id);
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return (
    <View>
      <Form onSubmit={handleSubmit} disabled={loading} />
      {error && <Text>Error: {error.message}</Text>}
    </View>
  );
}
```

### useUpdateProject(id)

```typescript
import { useUpdateProject } from './services/hooks';

function ProjectSettings({ projectId }) {
  const { update, loading, error } = useUpdateProject(projectId);

  const handleSave = async (updates) => {
    try {
      await update(updates);
      console.log('Project updated');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return <SettingsForm onSave={handleSave} disabled={loading} />;
}
```

### useDeleteProject()

```typescript
import { useDeleteProject } from './services/hooks';

function ProjectActions({ projectId }) {
  const { delete: deleteProject, loading, error } = useDeleteProject();

  const handleDelete = async () => {
    if (confirm('Delete project?')) {
      try {
        await deleteProject(projectId);
        console.log('Project deleted');
      } catch (err) {
        console.error('Failed:', err.message);
      }
    }
  };

  return <Button onPress={handleDelete} disabled={loading}>Delete</Button>;
}
```

### useEquipment(projectId)

```typescript
import { useEquipment } from './services/hooks';

function EquipmentList({ projectId }) {
  const { equipment, loading, error, refetch } = useEquipment(projectId);

  return (
    <View>
      {equipment.map((item) => (
        <EquipmentCard key={item.id} item={item} />
      ))}
      <Button onPress={refetch}>Refresh</Button>
    </View>
  );
}
```

### useParseFile(projectId)

```typescript
import { useParseFile } from './services/hooks';

function EquipmentImport({ projectId }) {
  const { parseFile, result, loading, error, progress } = useParseFile(projectId);

  const handleFileSelect = async (file) => {
    try {
      const result = await parseFile(file);
      console.log(`Imported: ${result.imported}, Failed: ${result.failed}`);
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return (
    <View>
      <FilePicker onSelect={handleFileSelect} disabled={loading} />
      {progress && <ProgressBar percent={progress.percent} />}
      {result && <Text>Imported {result.imported} items</Text>}
    </View>
  );
}
```

### useValidateSpecs(projectId)

```typescript
import { useValidateSpecs } from './services/hooks';

function ValidateEquipment({ projectId }) {
  const { validate, result, loading, error, progress } = useValidateSpecs(projectId);

  const handleValidate = async () => {
    try {
      const result = await validate();
      if (result.valid) {
        console.log('All equipment valid');
      } else {
        console.log('Validation errors:', result.errors);
      }
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return (
    <View>
      <Button onPress={handleValidate} disabled={loading}>
        Validate
      </Button>
      {loading && <ProgressBar percent={progress} />}
      {result && (
        <View>
          <Text>{result.valid ? 'Valid' : 'Invalid'}</Text>
          {result.errors.map((e) => (
            <Text key={e}>{e}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
```

### useEstimate(projectId)

```typescript
import { useEstimate } from './services/hooks';

function EstimateView({ projectId }) {
  const { estimate, loading, error, refetch } = useEstimate(projectId);

  return (
    <View>
      {loading && <Text>Loading...</Text>}
      {estimate && (
        <View>
          <Text>Total: ${estimate.totalCost}</Text>
          <Text>Labor Hours: {estimate.laborHours}</Text>
        </View>
      )}
      <Button onPress={refetch}>Refresh</Button>
    </View>
  );
}
```

### useCalculateEstimate(projectId)

```typescript
import { useCalculateEstimate } from './services/hooks';

function EstimateForm({ projectId }) {
  const { calculate, estimate, loading, error } = useCalculateEstimate(projectId);

  const handleCalculate = async (params) => {
    try {
      const result = await calculate(params);
      console.log('Estimate:', result.totalCost);
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return (
    <View>
      <EstimateFormFields onSubmit={handleCalculate} disabled={loading} />
      {estimate && <EstimateSummary estimate={estimate} />}
    </View>
  );
}
```

### useExportReport(projectId)

```typescript
import { useExportReport } from './services/hooks';

function ExportMenu({ projectId }) {
  const { exportReport, downloadAndSave, loading, error } = useExportReport(projectId);

  const handleExportPdf = async () => {
    try {
      await downloadAndSave({ format: 'pdf', includeEquipment: true });
      console.log('PDF exported and downloaded');
    } catch (err) {
      console.error('Failed:', err.message);
    }
  };

  return (
    <View>
      <Button onPress={handleExportPdf} disabled={loading}>
        Export PDF
      </Button>
      {error && <Text>{error.message}</Text>}
    </View>
  );
}
```

## Offline Services

### CacheService

```typescript
import { cacheService } from './services/offline';

// Cache data with TTL
cacheService.set('projects', projectList, 5 * 60 * 1000); // 5 min

// Retrieve cached data
const cached = cacheService.get('projects');

// Check if cached
if (cacheService.has('projects')) {
  // Use cache
}

// Clear specific cache
cacheService.delete('projects');

// Clear pattern
cacheService.clearMatching(/^projects:/);

// Get stats
const { size, keys } = cacheService.getStats();
```

### OfflineQueueService

```typescript
import { offlineQueueService } from './services/offline';

// Enqueue operation when offline
const opId = offlineQueueService.enqueue({
  type: 'create',
  endpoint: '/projects',
  data: projectData,
});

// Get pending operations
const queue = offlineQueueService.getQueue();

// Remove from queue (after successful sync)
offlineQueueService.remove(opId);

// Get stats
const { pending, size, oldestAt } = offlineQueueService.getStats();
```

### NetworkStatusService

```typescript
import { networkStatusService } from './services/offline';

// Subscribe to network changes
const unsubscribe = networkStatusService.subscribe((status) => {
  console.log('Online:', status.isOnline);
  console.log('Type:', status.type); // wifi, cellular, none, unknown
  console.log('Strength:', status.strength); // 0-100
});

// Check current status
const status = networkStatusService.getStatus();
if (status.isOnline) {
  // Sync offline queue
}

// Cleanup
unsubscribe();
```

## Error Handling

All API errors are typed and can be caught specifically:

```typescript
import {
  ApiErrorResponse,
  ValidationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
} from './services/api';

try {
  const project = await getProject('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Project not found');
  } else if (error instanceof ValidationError) {
    console.log('Invalid data:', error.details);
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    console.log('Network issue:', error.message);
  } else if (error instanceof ApiErrorResponse) {
    console.log('API error:', error.code, error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import {
  Project,
  Equipment,
  EstimateData,
  CreateProjectDTO,
  UpdateProjectDTO,
  ApiResponse,
} from './services/api';

// Strongly typed API responses
const response: ApiResponse<Project> = await getProject('123');

// Strongly typed DTOs
const createData: CreateProjectDTO = {
  name: 'Event',
  eventDate: '2026-04-15',
  eventType: 'concert',
};

// Strongly typed equipment
const equipment: Equipment[] = await getEquipmentList('project-123');
```

## Production Patterns

### Combined Project CRUD Hook

```typescript
import { useProjectCrud } from './services/hooks';

function ProjectManager({ projectId }) {
  const { list, single, create, update, delete: delete_, refetch } = useProjectCrud(projectId);

  return (
    <View>
      <ProjectList projects={list.projects} />
      <ProjectDetail project={single.project} />
      <ProjectForm onCreate={create.create} onUpdate={update.update} />
    </View>
  );
}
```

### Combined Estimate CRUD Hook

```typescript
import { useEstimateCrud } from './services/hooks';

function EstimateManager({ projectId }) {
  const { estimate, calculate, export: export_, history } = useEstimateCrud(projectId);

  return (
    <View>
      <EstimateForm onCalculate={calculate.calculate} />
      <EstimateSummary estimate={estimate.estimate} />
      <ExportMenu onExport={export_.downloadAndSave} />
      <EstimateHistory items={history.estimates} />
    </View>
  );
}
```

## Configuration

Set API URL via environment variables or runtime configuration:

```typescript
// .env (React Native)
REACT_APP_API_URL=http://agent-nuc.tail[net-domain]:3001/api/v1

// Runtime
import { apiClient } from './services/api';
apiClient.setBaseURL('http://new-url:3001/api/v1');
```

## Testing

All functions are pure and can be easily tested:

```typescript
import { ApiClient } from './services/api';

// Create test client
const testClient = new ApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  timeout: 5000,
  retryAttempts: 1,
});

// Mock or test endpoints
const response = await testClient.get('/projects');
```

## Notes

- Auth tokens are persisted in localStorage (use AsyncStorage shim in React Native)
- All requests include X-Request-ID and X-Request-Time headers for debugging
- Retry logic automatically handles transient network failures
- Cache TTL defaults to 5 minutes, configurable per entry
- Network detection works in browser and React Native with graceful fallback
