# Guia de Melhores Práticas Vue.js

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](02-vue.md)
> - [Português](02-vue.pt.md)

## Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Componentes](#componentes)
3. [Composables](#composables)
4. [TypeScript](#typescript)
5. [Melhores Práticas](#melhores-práticas)

## Estrutura do Projeto

### Organização de Diretórios

```plaintext
src/
├── assets/        # Recursos estáticos (imagens, fontes, etc.)
├── components/    # Componentes reutilizáveis
│   ├── base/     # Componentes base (botões, inputs, etc.)
│   ├── layout/   # Componentes de layout
│   └── feature/  # Componentes específicos de feature
├── composables/   # Composables reutilizáveis
├── router/        # Configuração de rotas
├── stores/        # Stores Pinia
├── types/         # Definições de tipos TypeScript
├── utils/         # Funções utilitárias
└── views/         # Componentes de página
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (BaseButton.vue)
- **Composables**: camelCase com prefixo 'use' (useAuth.ts)
- **Tipos**: PascalCase com sufixo descritivo (UserData.ts)
- **Stores**: camelCase com sufixo 'Store' (userStore.ts)

## Componentes

### Estrutura de Componente

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PropType } from 'vue'

// Props
interface Props {
  title: string
  items: Item[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete'): void
}>()

// Estado
const isLoading = ref(false)

// Computed
const filteredItems = computed(() => 
  props.items.filter(item => item.active)
)

// Métodos
const handleUpdate = (value: string) => {
  emit('update', value)
}
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <div v-if="isLoading" class="loading">
      Carregando...
    </div>
    <ul v-else>
      <li v-for="item in filteredItems" 
          :key="item.id"
          @click="handleUpdate(item.value)">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.component {
  /* Estilos específicos do componente */
}
</style>
```

### Props

```typescript
// Bom
const props = defineProps<{
  label: string
  value: number
  required?: boolean
  items: Item[]
}>()

// Ruim
const props = defineProps(['label', 'value', 'required', 'items'])
```

### Emits

```typescript
// Bom
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', data: FormData): void
}>()

// Ruim
const emit = defineEmits(['update:modelValue', 'submit'])
```

## Composables

### Estrutura de Composable

```typescript
// useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return {
    count,
    double,
    increment,
    decrement
  }
}

// Uso em componente
const { count, increment } = useCounter(10)
```

### Estado Compartilhado

```typescript
// useAuth.ts
import { ref } from 'vue'
import type { User } from '@/types'

const user = ref<User | null>(null)
const isAuthenticated = computed(() => !!user.value)

export function useAuth() {
  async function login(credentials: Credentials) {
    // Implementação
    user.value = await api.login(credentials)
  }

  async function logout() {
    user.value = null
    // Implementação
  }

  return {
    user,
    isAuthenticated,
    login,
    logout
  }
}
```

## TypeScript

### Tipos de Componente

```typescript
// types/components.ts
export interface BaseButtonProps {
  variant: 'primary' | 'secondary'
  size: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

// BaseButton.vue
const props = defineProps<BaseButtonProps>()
```

### Tipos de Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'

interface UserState {
  user: User | null
  preferences: UserPreferences
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    preferences: {}
  }),
  
  actions: {
    async fetchUser(id: string) {
      // Implementação
    }
  }
})
```

## Melhores Práticas

### Composição vs. Options API

```typescript
// Bom - Composition API com setup
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

// Evitar - Options API
export default {
  data() {
    return {
      count: 0
    }
  },
  computed: {
    double() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
```

### Reatividade

```typescript
// Bom
const state = reactive({
  user: null,
  preferences: {}
})

// Bom
const count = ref(0)
const user = ref<User | null>(null)

// Ruim
let count = 0 // Não reativo
const state = { user: null } // Não reativo
```

### Computed vs. Methods

```typescript
// Bom - Computed para valores derivados
const fullName = computed(() => 
  `${firstName.value} ${lastName.value}`
)

// Ruim - Método para valor derivado
function getFullName() {
  return `${firstName.value} ${lastName.value}`
}
```

### Watch

```typescript
// Bom
watch(searchQuery, async (newValue) => {
  if (newValue.length >= 3) {
    results.value = await search(newValue)
  }
}, { debounce: 300 })

// Melhor - Com cleanup
watch(searchQuery, async (newValue, _, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  
  if (newValue.length >= 3) {
    results.value = await search(newValue, { signal: controller.signal })
  }
}, { debounce: 300 })
```

### Lifecycle Hooks

```typescript
// Em componente
onMounted(() => {
  // Inicialização
})

onUnmounted(() => {
  // Cleanup
})

// Em composable
export function useSubscription() {
  const data = ref(null)
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    unsubscribe = subscribe(data)
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  return { data }
}
```

### Renderização Condicional

```vue
<template>
  <!-- Bom -->
  <div v-if="isLoading">Carregando...</div>
  <div v-else-if="error">Erro: {{ error }}</div>
  <div v-else>{{ data }}</div>

  <!-- Ruim -->
  <div v-if="isLoading">Carregando...</div>
  <div v-if="!isLoading && error">Erro: {{ error }}</div>
  <div v-if="!isLoading && !error">{{ data }}</div>
</template>
```

### Slots

```vue
<!-- Bom -->
<BaseCard>
  <template #header>
    <h2>Título</h2>
  </template>
  <template #default>
    <p>Conteúdo principal</p>
  </template>
  <template #footer>
    <BaseButton>Ação</BaseButton>
  </template>
</BaseCard>

<!-- Ruim -->
<BaseCard>
  <div class="header">
    <h2>Título</h2>
  </div>
  <p>Conteúdo principal</p>
  <div class="footer">
    <BaseButton>Ação</BaseButton>
  </div>
</BaseCard>
```

### Eventos

```vue
<!-- Bom -->
<template>
  <BaseButton @click="handleClick">
    Clique
  </BaseButton>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'action'): void
}>()

function handleClick() {
  // Lógica local
  emit('action')
}
</script>

<!-- Ruim -->
<BaseButton @click="emit('action')">
  Clique
</BaseButton>
```

### Testes

```typescript
import { mount } from '@vue/test-utils'
import UserList from './UserList.vue'

describe('UserList', () => {
  it('renderiza lista de usuários', () => {
    const wrapper = mount(UserList, {
      props: {
        users: [
          { id: 1, name: 'João' },
          { id: 2, name: 'Maria' }
        ]
      }
    })

    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('emite evento ao clicar em usuário', async () => {
    const wrapper = mount(UserList, {
      props: {
        users: [{ id: 1, name: 'João' }]
      }
    })

    await wrapper.find('li').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([1])
  })
})
``` 