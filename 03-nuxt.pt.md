# Guia de Melhores Práticas Nuxt.js

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](03-nuxt.md)
> - [Português](03-nuxt.pt.md)

## Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Roteamento](#roteamento)
3. [Estado](#estado)
4. [Composables](#composables)
5. [Plugins](#plugins)
6. [Middleware](#middleware)
7. [Server](#server)
8. [Configuração](#configuração)
9. [Melhores Práticas](#melhores-práticas)

## Estrutura do Projeto

### Organização de Diretórios

```plaintext
.nuxt/              # Diretório de build (gerado automaticamente)
assets/             # Recursos não compilados (SCSS, imagens)
components/         # Componentes Vue
  ├── base/        # Componentes base
  ├── layout/      # Componentes de layout
  └── feature/     # Componentes específicos de feature
composables/        # Composables reutilizáveis
layouts/            # Layouts da aplicação
middleware/         # Middleware de rota
pages/              # Páginas da aplicação (roteamento automático)
plugins/            # Plugins Vue/Nuxt
public/             # Arquivos estáticos públicos
server/             # API e middleware do servidor
  ├── api/         # Rotas da API
  ├── middleware/  # Middleware do servidor
  └── utils/       # Utilitários do servidor
stores/            # Stores Pinia
types/             # Definições de tipos TypeScript
utils/             # Funções utilitárias
.env               # Variáveis de ambiente
nuxt.config.ts     # Configuração do Nuxt
tsconfig.json      # Configuração do TypeScript
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (BaseButton.vue)
- **Páginas**: kebab-case (user-profile.vue)
- **Layouts**: kebab-case (default.vue)
- **Composables**: camelCase com prefixo 'use' (useAuth.ts)
- **Stores**: camelCase com sufixo 'Store' (userStore.ts)
- **API Routes**: kebab-case (/api/user-data)

## Roteamento

### Estrutura de Páginas

```plaintext
pages/
├── index.vue                 # /
├── about.vue                # /about
├── users/
│   ├── index.vue           # /users
│   ├── [id].vue           # /users/[id]
│   └── profile.vue        # /users/profile
└── posts/
    ├── [id]/
    │   └── index.vue      # /posts/[id]
    └── create.vue         # /posts/create
```

### Middleware de Rota

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser()
  
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})

// pages/admin.vue
definePageMeta({
  middleware: ['auth']
})
```

### Navegação

```vue
<template>
  <!-- Bom -->
  <NuxtLink to="/users">Usuários</NuxtLink>
  
  <!-- Com parâmetros -->
  <NuxtLink :to="{ 
    path: '/users', 
    query: { sort: 'name' } 
  }">
    Usuários
  </NuxtLink>
</template>

<script setup lang="ts">
// Navegação programática
const router = useRouter()
await router.push('/users')

// Com parâmetros
await router.push({
  path: '/users',
  query: { sort: 'name' }
})
</script>
```

## Estado

### Stores com Pinia

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  
  async function login(credentials: Credentials) {
    const { data } = await useFetch('/api/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data.value
  }
  
  function logout() {
    user.value = null
  }
  
  return {
    user,
    isAuthenticated,
    login,
    logout
  }
})

// Uso em componente
const userStore = useUserStore()
await userStore.login(credentials)
```

### Estado do Servidor

```typescript
// server/utils/state.ts
export const useServerState = () => {
  const state = useState<ServerState>('server-state', () => ({
    config: null,
    features: []
  }))
  
  return {
    state,
    async init() {
      state.value = await fetchServerState()
    }
  }
}

// plugins/server-state.ts
export default defineNuxtPlugin(async () => {
  const { init } = useServerState()
  await init()
})
```

## Composables

### Estrutura de Composable

```typescript
// composables/useAsync.ts
export function useAsync<T>(
  callback: () => Promise<T>
) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      data.value = await callback()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  return {
    data,
    error,
    loading,
    execute
  }
}

// Uso em componente
const { data, loading, execute } = useAsync(async () => {
  const response = await $fetch('/api/data')
  return response.data
})
```

### Composables com SSR

```typescript
// composables/useServerData.ts
export function useServerData() {
  const data = useState('server-data', () => null)
  
  async function fetch() {
    if (process.server) {
      // Executa apenas no servidor
      data.value = await fetchServerData()
    }
  }
  
  return {
    data,
    fetch
  }
}
```

## Plugins

### Estrutura de Plugin

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const api = axios.create({
    baseURL: config.public.apiBase
  })
  
  return {
    provide: {
      api
    }
  }
})

// Uso em componente
const { $api } = useNuxtApp()
const data = await $api.get('/users')
```

### Plugin com Injeção de Tipo

```typescript
// plugins/api.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      formatDate: (date: Date) => {
        return new Intl.DateTimeFormat().format(date)
      }
    }
  }
})

// types/index.d.ts
declare module '#app' {
  interface NuxtApp {
    $formatDate: (date: Date) => string
  }
}

// Uso em componente
const { $formatDate } = useNuxtApp()
const formattedDate = $formatDate(new Date())
```

## Middleware

### Middleware Global

```typescript
// middleware/default.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig()
  
  // Adiciona parâmetros globais
  to.query.version = config.public.version
})
```

### Middleware de API

```typescript
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  const token = getHeader(event, 'authorization')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  // Valida token
  event.context.auth = validateToken(token)
})
```

## Server

### Rotas de API

```typescript
// server/api/users/[id].ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }
    
    return user
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Internal server error'
    })
  }
})
```

### Middleware do Servidor

```typescript
// server/middleware/logger.ts
export default defineEventHandler((event) => {
  console.log(`${event.method} ${event.path}`)
})
```

### Utilitários do Servidor

```typescript
// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma

// server/api/users/index.ts
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany()
  return users
})
```

## Configuração

### Runtime Config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Chaves privadas (apenas servidor)
    apiSecret: '',
    
    // Chaves públicas (cliente + servidor)
    public: {
      apiBase: '',
      version: '1.0.0'
    }
  }
})

// Uso
const config = useRuntimeConfig()
console.log(config.public.apiBase)
```

### App Config

```typescript
// app.config.ts
export default defineAppConfig({
  theme: {
    primary: '#00DC82'
  }
})

// Uso
const appConfig = useAppConfig()
console.log(appConfig.theme.primary)
```

## Melhores Práticas

### SEO e Meta Tags

```typescript
// pages/index.vue
definePageMeta({
  layout: 'default'
})

useSeoMeta({
  title: 'Página Inicial',
  description: 'Descrição da página inicial',
  ogImage: '/images/og.jpg'
})

useHead({
  htmlAttrs: {
    lang: 'pt-BR'
  }
})
```

### Lazy Loading

```vue
<!-- Bom -->
<template>
  <LazyBaseModal v-if="showModal">
    Conteúdo do Modal
  </LazyBaseModal>
</template>

<!-- Melhor - Com Suspense -->
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      Carregando...
    </template>
  </Suspense>
</template>
```

### Error Handling

```vue
<template>
  <div>
    <NuxtErrorBoundary>
      <template #default>
        <UserProfile />
      </template>
      <template #error="{ error }">
        <div class="error">
          {{ error.message }}
          <button @click="error.value = null">
            Tentar novamente
          </button>
        </div>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>
```

### Cache e Persistência

```typescript
// composables/useCache.ts
export function useCache<T>(key: string) {
  const cache = useStorage<Record<string, T>>(key)
  
  function get(id: string) {
    return cache.value?.[id]
  }
  
  function set(id: string, data: T) {
    if (!cache.value) cache.value = {}
    cache.value[id] = data
  }
  
  return {
    get,
    set
  }
}

// Uso
const userCache = useCache<User>('users')
userCache.set('123', userData)
```

### Testes

```typescript
// tests/components/UserCard.test.ts
import { mount } from '@vue/test-utils'
import UserCard from '~/components/UserCard.vue'

describe('UserCard', () => {
  it('renderiza informações do usuário', () => {
    const wrapper = mount(UserCard, {
      props: {
        user: {
          name: 'João',
          email: 'joao@email.com'
        }
      }
    })
    
    expect(wrapper.text()).toContain('João')
    expect(wrapper.text()).toContain('joao@email.com')
  })
  
  it('emite evento ao clicar', async () => {
    const wrapper = mount(UserCard)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### Performance

```typescript
// composables/useInfiniteScroll.ts
export function useInfiniteScroll<T>(
  callback: (page: number) => Promise<T[]>
) {
  const items = ref<T[]>([])
  const page = ref(1)
  const loading = ref(false)
  const finished = ref(false)
  
  async function loadMore() {
    if (loading.value || finished.value) return
    
    loading.value = true
    const newItems = await callback(page.value)
    
    if (newItems.length === 0) {
      finished.value = true
    } else {
      items.value.push(...newItems)
      page.value++
    }
    
    loading.value = false
  }
  
  return {
    items,
    loading,
    finished,
    loadMore
  }
}

// Uso em componente
const { items, loadMore } = useInfiniteScroll(async (page) => {
  const { data } = await useFetch(`/api/items?page=${page}`)
  return data.value
})
``` 