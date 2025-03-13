# Nuxt.js: Best Practices Guide

## Project Structure

### Recommended Directory Structure

```bash
/
├── assets/           # Static files (css,scss,fonts)
├── components/       # Reusable Vue components
│   ├── UI/           # Generic UI components
│   ├── Forms/        # Form-specific components
│   ├── Users/        # User-specific components
│   ├── Products/     # Product-specific components
│   ├── Orders/       # Order-specific components
│   ├── Payments/     # Payment-specific components
│   ├── Notifications/ # Notification-specific components
│   └── Layouts/      # Layout-specific components
├── composables/      # Reusable Vue composables
├── layouts/          # Layouts for pages
├── middleware/       # Navigation middlewares
├── pages/            # Application pages (automatically generates routes)
├── plugins/          # Vue plugins
├── public/           # Static files (served directly)
├── server/           # Server-side code
│   ├── api/          # REST API routes
│   ├── middleware/   # Server-side middlewares
│   ├── routes/       # Customized server routes
│   └── utils/        # Server utilities
├── shared/           # Code shared between client and server
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   └── constants/    # Shared constants
├── stores/           # Pinia stores
└── app.vue           # Main application file
```

### Naming Conventions

#### Naming Components Based on File Structure

Nuxt 3 automatically generates component names based on file structure. This automatic naming convention is important and should be considered when structuring your directories.

#### How Nuxt 3 Generates Component Names

1. **Components in the root directory of `components/`**:
   - `components/Button.vue` → `<Button />`
   - `components/IconClose.vue` → `<IconClose />`

2. **Components in subdirectories**:
   - `components/Forms/Input.vue` → `<FormsInput />`
   - `components/UI/Cards/ProductCard.vue` → `<UiCardsProductCard />`

3. **Components with multiple segments**:
   - `components/Base/Button.vue` → `<BaseButton />`
   - `components/Base/Cards/ProductCard.vue` → `<BaseCardsProductCard />`

4. **Indexed components**:
   - `components/Forms/index.vue` → `<Forms />`
   - `components/UI/Cards/index.vue` → `<UiCards />`

#### Recommendations for Directory and Component Naming

Structure your directories to take advantage of the naming convention of Nuxt:

```bash
components/
  ├── App/          # Application-specific components
  │   ├── Header.vue             # → <AppHeader />
  │   └── Footer.vue             # → <AppFooter />
  ├── Base/         # Reusable base components
  │   ├── Button.vue             # → <BaseButton />
  │   └── Input.vue              # → <BaseInput />
  ├── UI/           # UI components (note lowercase)
  │   ├── Card.vue               # → <UiCard />
  │   └── Modal.vue              # → <UiModal />
  ├── User/         # User-specific components
  │   ├── Profile.vue            # → <UserProfile />
  │   └── List.vue               # → <UserList />
  ├── Form/         # Form components
  │   ├── Login.vue              # → <FormLogin />
  │   └── Register.vue           # → <FormRegister />
  └── Layout/       # Layout components
      ├── Default.vue            # → <LayoutDefault />
      └── Admin.vue              # → <LayoutAdmin />
```

Observe how the directory structure directly reflects the component names in Nuxt. This creates a consistent and predictable naming convention.

#### Tips for Efficient Naming

1. **Use PascalCase for component names**: `UserProfile.vue`, not `userProfile.vue`
2. **Consider directory structure carefully** to avoid overly long component names
3. **Use namespace prefixes via directory structure**: `UI/`, `Form/`, `Base/` etc.
4. **Maintain the native Nuxt pattern** for consistency and to avoid custom configurations that might confuse new team members

## Nuxt: Best Practices

### Auto-imports

Take advantage of Nuxt 3 auto-import:

```typescript
// No need to import ref, computed, etc.
const count = ref(0);
const doubleCount = computed(() => count.value * 2);

// No need to import components
// <UserCard /> will work automatically
```

### Pinia for State Management

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = computed((): boolean => !!currentUser.value);
  
  const fetchCurrentUser = async (): Promise<void> => {
    currentUser.value = await $fetch<User>('/api/me');
  };
  
  const logout = (): void => {
    currentUser.value = null;
  };
  
  return {
    currentUser,
    isAuthenticated,
    fetchCurrentUser,
    logout
  };
});
```

### Integrating Pinia Stores and Composables

The integration between Pinia stores and composables is a crucial part of Nuxt 3 development. When done correctly, this integration provides a clean and modular architecture.

#### When to Use Stores vs. Composables

**Use Pinia stores for:**
- Global shared state between components
- Data that needs to persist between navigations
- State that needs to be accessed in multiple parts of the application
- Centralized business logic

**Use Composables for:**
- Reusable UI-specific logic
- Functionalities that don't need global state
- API abstractions or services
- Component-specific logic that needs to be shared

#### Integration Patterns

1. **Composables consuming Stores**

```typescript
// composables/useUserProfile.ts
export const useUserProfile = () => {
  // Import the store
  const userStore = useUserStore();
  
  // Local state of the composable
  const isEditing = ref(false);
  const formData = reactive({
    name: '',
    email: ''
  });
  
  // Computed that depends on the store
  const canEdit = computed((): boolean => {
    return userStore.currentUser?.role === 'admin';
  });
  
  // Method that uses the store
  const initForm = (): void => {
    if (userStore.currentUser) {
      formData.name = userStore.currentUser.name;
      formData.email = userStore.currentUser.email;
    }
  };
  
  // Always good practice to observe store changes when the composable depends on it
  watch(() => userStore.currentUser, (newUser) => {
    if (newUser) {
      initForm();
    }
  });
  
  return {
    isEditing,
    formData,
    canEdit,
    initForm
  };
};
```

2. **Stores delegating to Composables**

Instead of implementing all logic in the store, you can delegate to specialized composables:

```typescript
// composables/useAuthAPI.ts - Composable for authentication API
export const useAuthAPI = () => {
  const login = async (credentials: Credentials): Promise<User> => {
    return await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: credentials
    });
  };
  
  const logout = async (): Promise<void> => {
    await $fetch('/api/auth/logout', { method: 'POST' });
  };
  
  return {
    login,
    logout
  };
};

// stores/auth.ts - Store that uses the composable
export const useAuthStore = defineStore('auth', () => {
  // Store state
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => !!user.value);
  
  // Use the composable for communication with API
  const authAPI = useAuthAPI();
  
  // Actions that delegate to the composable
  const login = async (credentials: Credentials): Promise<void> => {
    user.value = await authAPI.login(credentials);
  };
  
  const logout = async (): Promise<void> => {
    await authAPI.logout();
    user.value = null;
  };
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  };
});
```

#### Avoiding Circular References

Circular references occur when two modules depend on each other, which can cause initialization problems and hard-to-trace bugs.

**Problem:**

```typescript
// Store imports composable
// stores/product.ts
import { useProductUtils } from '~/composables/useProductUtils';

export const useProductStore = defineStore('product', () => {
  const productUtils = useProductUtils(); // Dependence on the composable
  // ...
});

// Composable imports store
// composables/useProductUtils.ts
import { useProductStore } from '~/stores/product';

export const useProductUtils = () => {
  const productStore = useProductStore(); // Circular dependence!
  // ...
};
```

**Solutions:**

1. **Use dependency injection**

```typescript
// composables/useProductUtils.ts - No direct dependence on the store
export const useProductUtils = () => {
  // Utility functions that don't directly depend on the store
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(price);
  };
  
  const calculateDiscount = (price: number, discountPercent: number): number => {
    return price * (1 - discountPercent / 100);
  };
  
  return {
    formatPrice,
    calculateDiscount
  };
};

// stores/product.ts
export const useProductStore = defineStore('product', () => {
  // Use the composable in the store
  const productUtils = useProductUtils();
  
  const products = ref<Product[]>([]);
  const selectedProduct = ref<Product | null>(null);
  
  const formattedPrice = computed((): string => {
    if (!selectedProduct.value) return '';
    return productUtils.formatPrice(selectedProduct.value.price);
  });
  
  // ...
  
  return {
    products,
    selectedProduct,
    formattedPrice
  };
});
```

2. **Create a service layer**

```typescript
// services/productService.ts - Independent layer
export const productService = {
  async fetchProducts(): Promise<Product[]> {
    return await $fetch<Product[]>('/api/products');
  },
  
  async fetchProductById(id: string): Promise<Product> {
    return await $fetch<Product>(`/api/products/${id}`);
  }
};

// composables/useProducts.ts
export const useProducts = () => {
  // Directly use the service
  const getFilteredProducts = async (category: string): Promise<Product[]> => {
    const products = await productService.fetchProducts();
    return products.filter(p => p.category === category);
  };
  
  return {
    getFilteredProducts
  };
};

// stores/product.ts
export const useProductStore = defineStore('product', () => {
  // Also use the service
  const products = ref<Product[]>([]);
  
  const fetchProducts = async (): Promise<void> => {
    products.value = await productService.fetchProducts();
  };
  
  return {
    products,
    fetchProducts
  };
});
```

3. **Isolation of responsibilities**

```typescript
// Clearly divide responsibilities
// composables/useProductFilters.ts - Only for filters
export const useProductFilters = () => {
  const filterByPrice = (products: Product[], maxPrice: number): Product[] => {
    return products.filter(p => p.price <= maxPrice);
  };
  
  const filterByCategory = (products: Product[], category: string): Product[] => {
    return products.filter(p => p.category === category);
  };
  
  return {
    filterByPrice,
    filterByCategory
  };
};

// stores/product.ts - Manages product state
export const useProductStore = defineStore('product', () => {
  // Does not depend on the composable, only provides data
  const products = ref<Product[]>([]);
  const isLoading = ref(false);
  
  const fetchProducts = async (): Promise<void> => {
    isLoading.value = true;
    try {
      products.value = await $fetch<Product[]>('/api/products');
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    products,
    isLoading,
    fetchProducts
  };
});

// In components, you can use both without causing circular references
const ProductList = defineComponent({
  setup() {
    const productStore = useProductStore();
    const { filterByPrice } = useProductFilters();
    
    // Combining store and composable in a safe way
    const filteredProducts = computed(() => 
      filterByPrice(productStore.products, 1000)
    );
    
    onMounted(() => {
      productStore.fetchProducts();
    });
    
    return {
      filteredProducts
    };
  }
});
```

#### Best Practices

1. **Define clearly the responsibilities**
   - Stores: global state management
   - Composables: reusable behaviors and logic
   - Services: communication with external APIs

2. **Create appropriate abstractions**
   - Use a service layer for API interactions
   - Divide complex functionalities into small focused composables
   - Keep stores clean and focused on state management

3. **Prefer unidirectional dependencies**
   - Composables → Stores: OK (composables can depend on stores)
   - Stores → Services: OK (stores can depend on services)
   - Stores → Composables: Careful! (potential for circular references)

4. **Use parameters to avoid coupling**
   - Pass state as parameters to composables when possible
   - This reduces direct coupling with stores

```typescript
// Before: Strongly coupled
const useProductSearch = () => {
  const productStore = useProductStore();
  
  const search = (query: string) => {
    return productStore.products.filter(/* ... */);
  };
  
  return { search };
};

// After: Decoupled
const useProductSearch = () => {
  const search = (products: Product[], query: string) => {
    return products.filter(/* ... */);
  };
  
  return { search };
};

// Usage:
const { products } = useProductStore();
const { search } = useProductSearch();
const results = search(products, 'query');
```

5. **Consider using dependency injection**
   - Use `provide/inject` for shared services
   - This facilitates testing and reduces coupling

```typescript
// In app.vue or a plugin
provide('productService', productService);

// In a composable
export const useProductFeature = () => {
  const productService = inject('productService');
  // Use the injected service
};
```

## SOLID and DRY in Nuxt.js

### Single Responsibility (S)

Each component, composable, or store should have a single responsibility:

```typescript
// ✅ GOOD: Composable with single responsibility
const useAuthentication = () => {
  // Lógica relacionada apenas à autenticação
};

// ❌ BAD: Mixing responsibilities
const useUserAndProductsAndCart = () => {
  // Too many responsibilities
};
```

### Open-Closed (O)

Design components to be extensible without modification:

```typescript
// ✅ GOOD: Flexible component with props and slots
<BaseButton
  :variant="variant"
  :size="size"
  :disabled="disabled"
>
  <slot />
  <slot name="icon" />
</BaseButton>
```

### Liskov Substitution (L)

Derived components should be substitutable for their base components:

```typescript
// Base component and variants should behave consistently
// BaseInput, EmailInput, PasswordInput should have compatible APIs
```

### Interface Segregation (I)

Divide large interfaces into smaller and more specific ones:

```typescript
// ✅ GOOD: Specific interfaces
interface Authenticatable {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

interface UserProfile {
  updateProfile: (data: ProfileData) => Promise<void>;
}

// Implementation can combine interfaces
class User implements Authenticatable, UserProfile {
  // ...
}
```

### Dependency Inversion (D)

Depend on abstractions, not concrete implementations:

```typescript
// ✅ GOOD: Depending on interfaces
interface ApiClient {
  get: <T>(url: string) => Promise<T>;
  post: <T>(url: string, data: unknown) => Promise<T>;
}

// Concrete implementation
class HttpApiClient implements ApiClient {
  // Implementation
}

// Service usage
const useUsers = (apiClient: ApiClient) => {
  // Use apiClient without worrying about the specific implementation
};
```

## Code Patterns

### 1. Consistent Naming

```typescript
// Components: PascalCase
UserProfile.vue, BaseButton.vue

// Composables: camelCase with 'use' prefix
useUsers.ts, useAuthentication.ts

// Vue files: PascalCase or kebab-case (prefer PascalCase)
UserList.vue, user-profile.vue

// Variables and functions: camelCase
const userData = ref<UserData>({});
const fetchUserData = async (): Promise<void> => { /* ... */ };

// Interfaces and Types: PascalCase
interface UserData {}
type ApiResponse<T> = { data: T; status: number };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
```

### 2. File Organization

Organize files by functionality, not by type:

```bash
# ✅ GOOD: Functionality-based organization
features/
  users/
    components/
    composables/
    types/
    store.ts
  products/
    components/
    composables/
    types/
    store.ts

# ❌ BAD: Type-based organization
components/
  UserList.vue
  ProductList.vue
composables/
  useUsers.ts
  useProducts.ts
```

## Data Fetching in Nuxt 3

Nuxt 3 provides several powerful data fetching utilities that make API integrations easier and more efficient.

### Overview of Data Fetching Methods

```typescript
// Available methods for data fetching in Nuxt 3:
// 1. $fetch - Basic fetch wrapper with improved DX
// 2. useFetch - Composable with caching and SSR support
// 3. useAsyncData - More control over data fetching
// 4. useLazyAsyncData - Lazy-loaded version of useAsyncData
// 5. fetchOptions - Custom fetch options
```

### Using $fetch

`$fetch` is a globally available fetch wrapper with improved developer experience:

```typescript
// Basic usage
const users = await $fetch<User[]>('/api/users');

// With options
const user = await $fetch<User>('/api/users/1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// POST request
const newUser = await $fetch<User>('/api/users', {
  method: 'POST',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// Error handling
try {
  const result = await $fetch('/api/data');
  // Process result
} catch (error) {
  if (error.response) {
    // Handle server error (4xx, 5xx)
    console.error('Server error:', error.response._data);
  } else {
    // Handle network/fetch error
    console.error('Fetch error:', error.message);
  }
}
```

### Using useFetch

`useFetch` is a composable that handles data fetching with automatic caching, request deduplication, and SSR support:

```typescript
// Basic usage in a component or page
const { data, pending, error, refresh } = useFetch<User[]>('/api/users');

// With options
const { data: user } = useFetch<User>('/api/users/1', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  key: `user-${id}`, // Custom cache key
});

// With query parameters
const { data: filteredUsers } = useFetch<User[]>('/api/users', {
  query: {
    role: 'admin',
    active: true
  }
});

// Lazy loading data
const { data: lazyData } = useFetch<User[]>('/api/users', {
  lazy: true
});

// Transform response before storing
const { data: transformedData } = useFetch<RawData, TransformedData>('/api/data', {
  transform: (data) => {
    return {
      ...data,
      formattedDate: new Date(data.timestamp).toLocaleDateString()
    };
  }
});

// Watching for changes
const id = ref(1);
const { data: user } = useFetch<User>(() => `/api/users/${id.value}`, {
  // Will refetch when id changes
  watch: [id]
});

// Manual refresh
const { data, refresh } = useFetch<User[]>('/api/users');
const refreshData = () => {
  refresh();
};

// Handling loading and error states in the template
<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <UserList :users="data" />
    </div>
  </div>
</template>
```

### Using useAsyncData

`useAsyncData` provides more control over the data fetching process:

```typescript
// Basic usage
const { data, pending, error, refresh } = useAsyncData<User[]>(
  'users', // Unique key
  () => $fetch('/api/users')
);

// With options
const { data: user } = useAsyncData<User>(
  `user-${id}`,
  () => $fetch(`/api/users/${id}`),
  {
    server: true, // Fetch on server (default)
    lazy: false, // Fetch immediately (default)
    immediate: true, // Start fetching immediately (default)
    watch: [id], // Dependencies that trigger refetch
    transform: (user) => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    })
  }
);

// Server-side only
const { data: serverData } = useAsyncData(
  'server-data',
  () => $fetch('/api/server-only-data'),
  { server: true, client: false }
);

// Client-side only
const { data: clientData } = useAsyncData(
  'client-data',
  () => $fetch('/api/client-only-data'),
  { server: false, client: true }
);

// Lazy loading with useLazyAsyncData (shorthand)
const { data: lazyData } = useLazyAsyncData(
  'lazy-data',
  () => $fetch('/api/heavy-data')
);
```

### Best Practices for Data Fetching

```typescript
// 1. Use appropriate key names for caching
// Good - specific, unique key:
const { data: user } = useAsyncData(`user-${id}`, () => $fetch(`/api/users/${id}`));

// Bad - generic key that might conflict:
const { data: userData } = useAsyncData('data', () => $fetch(`/api/users/${id}`));

// 2. Transform data close to the source
const { data: posts } = useAsyncData('posts', async () => {
  const rawPosts = await $fetch<Post[]>('/api/posts');
  // Transform immediately rather than in computed or later
  return rawPosts.map(post => ({
    ...post,
    formattedDate: new Date(post.createdAt).toLocaleDateString(),
    excerpt: post.content.substring(0, 100) + '...'
  }));
});

// 3. Handle loading and error states consistently
<template>
  <div>
    <BaseLoading v-if="pending" />
    <BaseError v-else-if="error" :error="error" />
    <div v-else>
      <UserList :users="data || []" /> <!-- Use empty fallback -->
    </div>
  </div>
</template>

// 4. Use types for better DX
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const { data: users } = useFetch<User[]>('/api/users');
// Now users.value has proper typing

// 5. Avoid unnecessary fetches
const shouldFetch = computed(() => {
  return userHasPermission.value && isFeatureEnabled.value;
});

const { data } = useAsyncData(
  'conditional-data',
  () => shouldFetch.value ? $fetch('/api/data') : null
);

// 6. Use constants for API endpoints
const API_ENDPOINTS = {
  USERS: '/api/users',
  USER_BY_ID: (id: number) => `/api/users/${id}`,
  POSTS: '/api/posts',
};

const { data: users } = useFetch<User[]>(API_ENDPOINTS.USERS);
const { data: user } = useFetch<User>(() => API_ENDPOINTS.USER_BY_ID(userId.value));

// 7. Create custom composables for API logic
const useUsers = () => {
  const getAll = () => {
    return useFetch<User[]>(API_ENDPOINTS.USERS);
  };
  
  const getById = (id: Ref<number> | number) => {
    const userId = isRef(id) ? id : ref(id);
    return useFetch<User>(() => API_ENDPOINTS.USER_BY_ID(userId.value), {
      watch: [userId]
    });
  };
  
  return {
    getAll,
    getById
  };
};

// Usage:
const { getAll, getById } = useUsers();
const { data: allUsers } = getAll();
const { data: currentUser } = getById(1);
```

### State Management with Data Fetching

Combining Pinia stores with Nuxt data fetching:

```typescript
// stores/users.ts
export const useUserStore = defineStore('users', () => {
  const userList = ref<User[]>([]);
  const currentUser = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  
  const fetchUsers = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Using $fetch inside a store action
      userList.value = await $fetch<User[]>('/api/users');
    } catch (err) {
      error.value = err as Error;
      console.error('Failed to fetch users:', err);
    } finally {
      isLoading.value = false;
    }
  };
  
  const fetchUserById = async (id: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    
    try {
      currentUser.value = await $fetch<User>(`/api/users/${id}`);
    } catch (err) {
      error.value = err as Error;
      currentUser.value = null;
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    userList,
    currentUser,
    isLoading,
    error,
    fetchUsers,
    fetchUserById
  };
});

// Component using the store
const UserDetails = defineComponent({
  setup() {
    const route = useRoute();
    const userStore = useUserStore();
    const userId = computed(() => Number(route.params.id));
    
    onMounted(async () => {
      await userStore.fetchUserById(userId.value);
    });
    
    return {
      user: computed(() => userStore.currentUser),
      isLoading: computed(() => userStore.isLoading),
      error: computed(() => userStore.error)
    };
  }
});
``` 