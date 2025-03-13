# Vue.js: Best Practices Guide

## Vue Files Structure

### Mandatory Order of Sections in .vue Files

To maintain code consistency, follow this mandatory order for sections in your `.vue` files:

```vue
<script setup lang="ts">
// 1. Script (always TypeScript)
// TypeScript code here
</script>

<template>
  <!-- 2. Template -->
  <!-- HTML structure here -->
</template>

<style scoped>
/* 3. Style */
/* Estilos CSS aqui */
</style>

<i18n lang="yaml">
en:
  addToCart: "Add to Cart"
pt:
  addToCart: "Adicionar ao Carrinho"
</i18n>
```

#### Important Rules:

1. **Script always first**: Always use `<script setup lang="ts">` to ensure TypeScript typing
2. **Template after script**: Place the template after the script for better code readability
3. **Style after template**: Styles should come after the template and generally use `scoped`
4. **i18n last**: If using internationalization, this section should be last

### Complete Example of Vue File Following the Correct Order

```vue
<script setup lang="ts">
// 1. Imports (minimized due to auto-import)
import type { Product } from '~/shared/types';

// 2. Definition of types/interfaces
interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

// 3. Props and emits
const props = withDefaults(defineProps<ProductCardProps>(), {
  showPrice: true
});

const emit = defineEmits<{
  'add-to-cart': [productId: string];
}>();

// 4. Refs and state
const isHovered = ref(false);

// 5. Computed properties
const formattedPrice = computed((): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(props.product.price);
});

// 6. Lifecycle hooks
onMounted((): void => {
  console.log('Componente montado');
});

// 7. Methods
const addToCart = (): void => {
  emit('add-to-cart', props.product.id);
};
</script>

<template>
  <div 
    class="product-card"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <img :src="product.image" :alt="product.name" />
    <h3>{{ product.name }}</h3>
    <p v-if="showPrice">{{ formattedPrice }}</p>
    <button @click="addToCart">
      {{ $t('addToCart') }}
    </button>
  </div>
</template>

<style scoped>
.product-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Outros estilos... */
</style>

<i18n lang="yaml">
en:
  addToCart: "Add to Cart"
pt:
  addToCart: "Adicionar ao Carrinho"
</i18n>
```

## Vue: Best Practices

### Composables for Reusable Logic

```typescript
// composables/useUsers.ts
export const useUsers = () => {
  const users = ref<User[]>([]);
  const isLoading = ref(false);
  
  const fetchUsers = async (): Promise<void> => {
    isLoading.value = true;
    try {
      users.value = await $fetch<User[]>('/api/users');
    } finally {
      isLoading.value = false;
    }
  };
  
  return {
    users,
    isLoading,
    fetchUsers
  };
};
```

### Components: defineProps and defineEmits

```typescript
// components/UserCard.vue
<script setup lang="ts">
interface UserCardProps {
  user: User;
  showDetails?: boolean;
}

const props = defineProps<UserCardProps>();
const emit = defineEmits<{
  'update:user': [updatedUser: User];
  'delete': [userId: number];
}>();

const updateUser = (newData: Partial<User>): void => {
  emit('update:user', { ...props.user, ...newData });
};
</script>
```

### withDefaults for Default Values in Props

The `withDefaults` is a helper function to define default values for props when using TypeScript generic syntax:

```typescript
// components/UserProfile.vue
<script setup lang="ts">
interface UserProfileProps {
  user: User;
  showAvatar?: boolean;
  size?: 'small' | 'medium' | 'large';
  theme?: string;
  enableEditing?: boolean;
}

// Define props with default values
const props = withDefaults(defineProps<UserProfileProps>(), {
  showAvatar: true,
  size: 'medium',
  theme: 'light',
  enableEditing: false
});

// Usage
console.log(props.size); // 'medium' by default if not provided
</script>
```

Advantages of `withDefaults`:

1. Complete typing with TypeScript
2. Default values are inferred correctly
3. Better IDE support
4. Compile-time validation

### Lifecycle Hooks

Vue 3 offers lifecycle hooks that can be used inside components with `<script setup>`:

```typescript
// components/DataTable.vue
<script setup lang="ts">
// Lifecycle hooks (recommended order)
onBeforeMount(() => {
  // Preparations before component mounting
  console.log('Component is about to be mounted');
});

onMounted(() => {
  // Executed after component mounted to DOM
  fetchInitialData();
});

onBeforeUpdate(() => {
  // Before component update
  console.log('Component is about to be updated');
});

onUpdated(() => {
  // After component updated
  console.log('Component was updated');
});

onBeforeUnmount(() => {
  // Before component removed from DOM
  cleanupResources();
});

onUnmounted(() => {
  // After component removed from DOM
  console.log('Component was unmounted');
});

onErrorCaptured((err) => {
  // Captures errors from child components
  console.error('Error captured:', err);
  return false; // Prevents propagation
});
</script>
```

**Execution order of lifecycle hooks:**
1. `onBeforeMount`
2. `onMounted`
3. `onBeforeUpdate` (when data changes)
4. `onUpdated` (after rendering)
5. `onBeforeUnmount` (before destruction)
6. `onUnmounted` (after destruction)

### Organizing Code in Components

Organize your components following a consistent structure:

```typescript
// components/Feature/FeatureComponent.vue
<script setup lang="ts">
// 1. Imports (if necessary, despite auto-import)
import { SomeType } from '~/shared/types';
import { externalLibrary } from 'external-library';

// 2. Definition of types and interfaces (specific to component)
interface ComponentProps {
  title: string;
  items: SomeType[];
}

// 3. Constants
const STATUS_ACTIVE = 'active';
const MAX_ITEMS = 10;
const ANIMATION_DURATION = 300;

// 4. Props and emits
const props = withDefaults(defineProps<ComponentProps>(), {
  items: () => []
});

const emit = defineEmits<{
  'update': [newValue: SomeType];
  'delete': [id: number];
}>();

// 5. Refs and reactive states
const isLoading = ref(false);
const searchQuery = ref('');
const selectedItem = ref<SomeType | null>(null);

// 6. Computed properties
const filteredItems = computed((): SomeType[] => {
  // Use constant MAX_ITEMS defined above
  return props.items
    .filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .slice(0, MAX_ITEMS);
});

// 7. Lifecycle hooks
onMounted((): void => {
  initializeComponent();
});

// 8. Methods and functions
const initializeComponent = (): void => {
  // Initialization
};

const handleItemClick = (item: SomeType): void => {
  selectedItem.value = item;
  emit('update', item);
};

// 9. Watch (if necessary)
watch(searchQuery, (newValue: string): void => {
  console.log(`Search changed to: ${newValue}`);
}, { immediate: true });
</script>

<template>
  <div 
    class="feature-component"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <h2>{{ title }}</h2>
    
    <input 
      v-model="searchQuery"
      type="text"
      placeholder="Buscar..."
    />
    
    <div v-if="isLoading">Carregando...</div>
    
    <ul v-else>
      <li 
        v-for="item in filteredItems" 
        :key="item.id"
        @click="handleItemClick(item)"
        :class="{ 'active': item.status === STATUS_ACTIVE }"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.feature-component {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.feature-component:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Using the constant ANIMATION_DURATION in CSS variables */
:root {
  --animation-duration: v-bind('ANIMATION_DURATION + "ms"');
}

.active {
  background-color: #ebf8ff;
  transition: background-color var(--animation-duration) ease;
}
</style>
```

This organization follows a logical structure that helps with readability and maintainability:

1. **Imports** (minimized due to auto-import)
2. **Types/Interfaces** specific to the component
3. **Constants** (fixed values used in the component)
4. **Props and Emits**
5. **Refs and local state**
6. **Computed properties**
7. **Lifecycle hooks**
8. **Methods and functions**
9. **Watchers**

#### Best Practices for Constants

1. **Use UPPER_SNAKE_CASE for constants**: Makes visual identification easier
2. **Define constants at the beginning of the component**: Improves readability and avoids "magic numbers/strings"
3. **Extract shared constants**: For constants used in multiple components, consider moving them to dedicated files
4. **Use TypeScript to type constants**
5. **Use constants for state management**

## Vue Performance Tips

1. **Lazy Loading of Components**

```typescript
// Lazy loading of heavy components
const HeavyComponent = defineAsyncComponent(
  () => import('@/components/HeavyComponent.vue')
);
```

2. **Computed Properties vs. Methods**

```typescript
// ✅ GOOD: Use computed for derived values
const fullName = computed((): string => `${firstName.value} ${lastName.value}`);

// ❌ BAD: Recalculation on every render
const getFullName = (): string => {
  return `${firstName.value} ${lastName.value}`;
};
```

3. **Optimization of v-for with key**

```vue
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>
```

4. **Avoid unnecessary watchers**

```typescript
// ✅ GOOD: Use computed when possible
const fullName = computed((): string => `${firstName.value} ${lastName.value}`);

// ❌ BAD: Unnecessary watcher
watch([firstName, lastName], ([newFirstName, newLastName]) => {
  fullName.value = `${newFirstName} ${newLastName}`;
});
``` 

## Conditional Logic Best Practices

```typescript
// Component with clear conditional logic
<script setup lang="ts">
import { ref, computed } from 'vue';
import type { User } from '~/shared/types';

const props = defineProps<{
  user: User;
}>();

// Bad - Complex conditions in the template
<template>
  <div>
    <UserProfile v-if="user.role === 'admin' && user.isActive && !user.isLocked" />
    <button 
      :disabled="user.role !== 'admin' || !user.isActive || user.isLocked || user.accessLevel < 5"
      @click="approveRequest"
    >
      Approve
    </button>
  </div>
</template>

// Good - Extract conditions into computed properties
<script setup lang="ts">
import { computed } from 'vue';
import type { User } from '~/shared/types';

const props = defineProps<{
  user: User;
}>();

// Clear variable names explain the business logic
const isAdmin = computed(() => props.user.role === 'admin');
const isActiveUser = computed(() => props.user.isActive);
const isNotLocked = computed(() => !props.user.isLocked);
const hasSufficientAccess = computed(() => props.user.accessLevel >= 5);

// Combine related conditions
const canManageContent = computed(() => 
  isAdmin.value && isActiveUser.value && isNotLocked.value
);

const canApproveRequests = computed(() => 
  canManageContent.value && hasSufficientAccess.value
);
</script>

<template>
  <div>
    <UserProfile v-if="canManageContent" />
    <button 
      :disabled="!canApproveRequests"
      @click="approveRequest"
    >
      Approve
    </button>
  </div>
</template>

// Another example - handling UI states
<script setup lang="ts">
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const data = ref(null);

// Computed properties for UI states
const showLoader = computed(() => isLoading.value);
const showError = computed(() => !isLoading.value && hasError.value);
const showData = computed(() => !isLoading.value && !hasError.value && data.value !== null);
const showEmptyState = computed(() => !isLoading.value && !hasError.value && data.value === null);

// This makes template logic more readable
</script>

<template>
  <div>
    <LoadingSpinner v-if="showLoader" />
    <ErrorMessage v-else-if="showError" :message="errorMessage" />
    <DataDisplay v-else-if="showData" :data="data" />
    <EmptyState v-else-if="showEmptyState" />
  </div>
</template>

// Time-based comparisons
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  expiryDate: string;
}>();

// Constants with clear names
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAYS_IN_MS = 3 * ONE_DAY_IN_MS;
const SEVEN_DAYS_IN_MS = 7 * ONE_DAY_IN_MS;

// Computed properties for time-based conditions
const expiryTimestamp = computed(() => new Date(props.expiryDate).getTime());
const currentTimestamp = computed(() => Date.now());
const timeUntilExpiry = computed(() => expiryTimestamp.value - currentTimestamp.value);

const isExpired = computed(() => timeUntilExpiry.value <= 0);
const expiresWithinOneDay = computed(() => timeUntilExpiry.value > 0 && timeUntilExpiry.value <= ONE_DAY_IN_MS);
const expiresWithinThreeDays = computed(() => timeUntilExpiry.value > ONE_DAY_IN_MS && timeUntilExpiry.value <= THREE_DAYS_IN_MS);
const expiresWithinWeek = computed(() => timeUntilExpiry.value > THREE_DAYS_IN_MS && timeUntilExpiry.value <= SEVEN_DAYS_IN_MS);

// This approach makes the template much clearer
</script>

<template>
  <div>
    <ExpiredBadge v-if="isExpired" />
    <CriticalWarning v-else-if="expiresWithinOneDay" />
    <WarningBadge v-else-if="expiresWithinThreeDays" />
    <NoticeBadge v-else-if="expiresWithinWeek" />
  </div>
</template>
``` 