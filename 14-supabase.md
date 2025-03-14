# Boas Práticas para Nuxt com Supabase

Este guia cobre as melhores práticas para integrar e utilizar o Supabase em aplicações Nuxt, com foco na separação clara de responsabilidades entre frontend e backend. Todo o código neste guia assume o uso completo de TypeScript e Nuxt, aproveitando ao máximo o sistema de tipos estáticos para criar aplicações mais seguras e manuteníveis.

## Configuração Inicial

### Instalação do Módulo

```bash
# Instalar o módulo
npx nuxi@latest module add supabase

# Ou usando yarn
yarn add -D @nuxtjs/supabase
```

Adicione o módulo ao seu arquivo `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
})
```

### Configuração de Variáveis de Ambiente

No arquivo `.env`:

```
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_KEY="sua_chave_anon_key"
SUPABASE_SERVICE_KEY="sua_chave_service_role" 
```

### Configuração do Módulo

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/supabase'],
  supabase: {
    // Habilita redirecionamento para login quando não autenticado
    redirect: true,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/auth/login', '/auth/register', '/'],
      saveRedirectToCookie: true,
    },
    // Habilita cookies para compartilhar sessão entre cliente e servidor
    useSsrCookies: true,
    // Caminho para definições de tipos do banco de dados
    types: './shared/types/database.types.ts',
  }
})
```

## Estrutura do Projeto

Organize seu projeto para separar claramente as responsabilidades:

```
📂 project/
├── 📂 components/
├── 📂 pages/
├── 📂 layouts/
├── 📂 server/
│   ├── 📂 api/
│   ├── 📂 middleware/
│   ├── 📂 routes/
│   └── 📂 utils/
├── 📂 shared/
│   ├── 📂 types/
│   │   └── 📄 database.types.ts
│   └── 📂 utils/
└── 📂 stores/
```

## Geração de Tipos

Gere os tipos TypeScript do seu banco de dados Supabase:

```bash
supabase gen types typescript --project-id SeuProjetoId > shared/types/database.types.ts

# Ou para ambiente local
supabase gen types typescript --local > shared/types/database.types.ts
```

## Práticas no Frontend (Cliente)

### Princípio Fundamental

**Mantenha o frontend "burro"** - Responsável apenas pela apresentação e interação com o usuário. Toda a lógica de negócios deve estar no backend.

### Uso de Composables

#### 1. useSupabaseClient

Use para operações de autenticação e consultas simples de leitura:

```typescript
<script setup lang="ts">
import type { Database } from '~/shared/types/database.types'

// Use tipos gerados a partir do seu banco de dados
const client = useSupabaseClient<Database>()

// Autenticação
const login = async (email: string, password: string) => {
  try {
    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) throw error
  } catch (error) {
    // Tratar erro
  }
}

// Operações de leitura
const fetchPublicData = async () => {
  try {
    // Para dados públicos que respeitam RLS
    const { data, error } = await client.from('public_table').select('*')
    if (error) throw error
    return data
  } catch (error) {
    // Tratar erro
    return []
  }
}
</script>
```

#### 2. useSupabaseUser

Para acessar dados do usuário atual:

```typescript
<script setup lang="ts">
const user = useSupabaseUser()

// Acesso reativo aos dados do usuário
const userName = computed(() => user.value?.user_metadata?.name || 'Usuário')

// Criar um watcher para mudanças no usuário
watch(user, (newUser) => {
  if (newUser) {
    // Usuário logado
  } else {
    // Usuário deslogado
  }
}, { immediate: true })
</script>
```

#### 3. useSupabaseSession

Útil para acessar a sessão completa:

```typescript
<script setup lang="ts">
const session = useSupabaseSession()

// Verificar se o usuário está autenticado
const isAuthenticated = computed(() => !!session.value)

// Obter token de acesso quando necessário
const getAccessToken = computed(() => session.value?.access_token)
</script>
```

#### 4. useSupabaseCookieRedirect

Para gerenciar redirecionamentos após login:

```typescript
<script setup lang="ts">
// Na página de callback após autenticação
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()
const router = useRouter()

// Redireciona para a página anterior após login bem-sucedido
watch(user, () => {
  if (user.value) {
    // Obtém o caminho salvo e o limpa do cookie
    const path = redirectInfo.pluck()
    // Redireciona para o caminho salvo ou para o dashboard
    router.push(path || '/dashboard')
  }
}, { immediate: true })
</script>
```

### Acesso a Dados via API Backend

Prefira usar APIs do backend para operações com dados:

```typescript
<script setup lang="ts">
import type { Post } from '~/shared/types/models'

// Para operações complexas, chame uma API no backend
const { data: posts, pending, error, refresh } = await useFetch<Post[]>('/api/posts')

// Para ações que modificam dados, use o módulo $fetch
const createPost = async (post: Partial<Post>) => {
  try {
    const newPost = await $fetch<Post>('/api/posts', {
      method: 'POST',
      body: post
    })
    
    // Atualizar lista local
    refresh()
    
    return newPost
  } catch (error) {
    // Tratar erro
  }
}
</script>
```

## Práticas no Backend (Servidor)

### Princípio Fundamental

**O backend é responsável por toda a lógica de negócios** - Valide, processe e proteja os dados antes de enviá-los ao frontend.

### Arquitetura em Camadas com Services

Para aplicar boas práticas de arquitetura, organize o backend em camadas:

```
📂 server/
├── 📂 api/            # Endpoints HTTP expostos
├── 📂 services/       # Lógica de negócios
├── 📂 repositories/   # Acesso a dados
├── 📂 middleware/     # Middleware de autenticação, logging
├── 📂 utils/          # Utilitários comuns
└── 📂 types/          # Tipos específicos do backend
```

#### Implementando Services

Os services encapsulam a lógica de negócios e facilitam a reutilização de código:

```typescript
// server/services/posts.service.ts
import type { Database } from '~/shared/types/database.types'
import type { CreatePostPayload, Post } from '~/shared/types/models'

export default class PostsService {
  // Injeção de dependência: recebe cliente Supabase
  constructor(private client: SupabaseClient<Database>) {}

  async getAllByUser(userId: string): Promise<Post[]> {
    const { data, error } = await this.client
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw createError({ statusCode: 500, message: error.message })
    return data
  }

  async create(userId: string, payload: CreatePostPayload): Promise<Post> {
    // Validação
    if (!payload.title || payload.title.trim().length < 3) {
      throw createError({
        statusCode: 400,
        message: 'Título deve ter pelo menos 3 caracteres'
      })
    }

    // Lógica de negócios
    const newPost = {
      ...payload,
      user_id: userId,
      slug: this.generateSlug(payload.title),
      created_at: new Date().toISOString()
    }

    // Persistência
    const { data, error } = await this.client
      .from('posts')
      .insert(newPost)
      .select()
      .single()
      
    if (error) throw createError({ statusCode: 500, message: error.message })
    return data
  }

  // Métodos privados de utilidade
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 60) + '-' + Date.now().toString(36)
  }
}
```

#### Utilizando Services nas API Routes

```typescript
// server/api/posts/index.ts
import { Database } from '~/shared/types/database.types'
import PostsService from '~/server/services/posts.service'

export default defineEventHandler(async (event) => {
  // Verificação de autenticação
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }
  
  // Inicialização do service
  const client = serverSupabaseClient<Database>(event)
  const postsService = new PostsService(client)
  
  // Obtenção e retorno dos dados
  return await postsService.getAllByUser(user.id)
})

// server/api/posts/index.post.ts
export default defineEventHandler(async (event) => {
  // Verificação de autenticação
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }
  
  // Validação de body
  const body = await readBody(event)
  
  // Inicialização do service
  const client = serverSupabaseClient<Database>(event)
  const postsService = new PostsService(client)
  
  // Processamento e retorno dos dados
  return await postsService.create(user.id, body)
})
```

### Aplicação dos Princípios SOLID

#### S - Princípio da Responsabilidade Única

Cada service se responsabiliza por uma única entidade de domínio:

```typescript
// ✅ Bom: Services específicos por domínio
// server/services/auth.service.ts
export default class AuthService { /* Métodos de autenticação */ }

// server/services/posts.service.ts
export default class PostsService { /* Métodos de posts */ }

// ❌ Ruim: Service com múltiplas responsabilidades
// server/services/app.service.ts
export default class AppService {
  /* Mistura de métodos de autenticação, posts, comentários, etc. */
}
```

#### O - Princípio Aberto/Fechado

Estruture o código para extensão sem modificação:

```typescript
// Base de consulta abstrata
// server/repositories/base.repository.ts
export class BaseRepository<T> {
  constructor(
    protected client: SupabaseClient,
    protected table: string
  ) {}

  async findAll(query = {}): Promise<T[]> {
    return this.client.from(this.table).select('*').match(query)
  }
}

// Extensão específica
// server/repositories/posts.repository.ts
export class PostsRepository extends BaseRepository<Post> {
  constructor(client: SupabaseClient) {
    super(client, 'posts')
  }

  // Métodos específicos adicionais
  async findWithComments(postId: string): Promise<Post> {
    return this.client
      .from(this.table)
      .select('*, comments(*)')
      .eq('id', postId)
      .single()
  }
}
```

#### L - Princípio da Substituição de Liskov

As classes derivadas devem ser substituíveis por suas classes base:

```typescript
// Abstração para transformadores de conteúdo
interface ContentTransformer {
  transform(content: string): string
}

// Implementações diferentes, mas intercambiáveis
class MarkdownTransformer implements ContentTransformer {
  transform(content: string): string {
    // Transformação de markdown para HTML
    return markdownToHtml(content)
  }
}

class PlainTextTransformer implements ContentTransformer {
  transform(content: string): string {
    // Sanitização de HTML
    return sanitizeHtml(content)
  }
}

// Service que usa qualquer transformer
class ContentService {
  constructor(private transformer: ContentTransformer) {}
  
  formatContent(content: string): string {
    return this.transformer.transform(content)
  }
}
```

#### I - Princípio da Segregação de Interface

Prefira múltiplas interfaces específicas a uma interface genérica:

```typescript
// ✅ Bom: Interfaces específicas
interface DataReader {
  read(id: string): Promise<any>
  findMany(query: any): Promise<any[]>
}

interface DataWriter {
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<void>
}

// Implementação que separa responsabilidades
class ReadOnlyPostsRepository implements DataReader {
  // Implementações de leitura
}

class AdminPostsRepository implements DataReader, DataWriter {
  // Implementações completas
}

// ❌ Ruim: Interface monolítica
interface Repository {
  read(id: string): Promise<any>
  findMany(query: any): Promise<any[]>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<void>
  // + 10 outros métodos...
}
```

#### D - Princípio da Inversão de Dependência

Dependa de abstrações, não implementações concretas:

```typescript
// Definição de abstrações
interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>
}

// Implementação concreta
class SendGridEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Implementação específica do SendGrid
  }
}

// Service de usuário depende de abstração, não implementação
class UserService {
  constructor(private emailService: EmailService) {}
  
  async resetPassword(email: string): Promise<void> {
    // Lógica de reset de senha...
    
    // Uso da abstração
    await this.emailService.sendEmail(
      email,
      'Redefinição de senha',
      'Clique no link para redefinir sua senha...'
    )
  }
}

// Factory que instancia as dependências
export function createUserService(): UserService {
  // A implementação correta é injetada, mas o UserService não sabe qual é
  return new UserService(new SendGridEmailService())
}
```

### Aplicando o Princípio DRY (Don't Repeat Yourself)

#### 1. Abstração de acesso ao Supabase

```typescript
// server/utils/supabase.ts
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/shared/types/database.types'

export async function getSupabaseClient(event) {
  return await serverSupabaseClient<Database>(event)
}

export async function getSupabaseAdmin(event) {
  return await serverSupabaseServiceRole<Database>(event)
}

export function handleSupabaseError(error: any) {
  console.error('Erro do Supabase:', error)
  
  if (error?.code === 'PGRST116') {
    throw createError({
      statusCode: 403,
      message: 'Acesso proibido: violação de política'
    })
  }
  
  throw createError({
    statusCode: error?.code === 'PGRST104' ? 404 : 500,
    message: error?.message || 'Erro ao acessar o banco de dados'
  })
}
```

#### 2. Middleware de Autenticação Reutilizável

```typescript
// server/middleware/auth.ts
export default defineEventHandler(async (event) => {
  // Ignora rotas públicas e de autenticação
  if (
    event.path.startsWith('/api/public') ||
    event.path.startsWith('/api/auth')
  ) {
    return
  }
  
  // Verifica autenticação para todas as outras rotas
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Autenticação necessária'
    })
  }
  
  // Anexa o usuário ao contexto para facilitar o acesso
  event.context.user = user
})
```

#### 3. Factory de Service

```typescript
// server/utils/service-factory.ts
import PostsService from '../services/posts.service'
import UsersService from '../services/users.service'
import CommentsService from '../services/comments.service'

// Cache de service por requisição
const serviceCache = new Map()

// Factory de serviços
export async function getService(event, ServiceClass) {
  const cacheKey = `${event.context.user?.id}:${ServiceClass.name}`
  
  if (!serviceCache.has(cacheKey)) {
    // Obtenha o cliente apropriado para o usuário
    const client = await getSupabaseClient(event)
    
    // Crie e cache a instância do service
    serviceCache.set(cacheKey, new ServiceClass(client))
  }
  
  return serviceCache.get(cacheKey)
}

// Helpers específicos
export async function getPostsService(event) {
  return getService(event, PostsService)
}

export async function getUsersService(event) {
  return getService(event, UsersService)
}
```

#### 4. Composables Reutilizáveis no Cliente

```typescript
// composables/useApiCrud.ts
export function useApiCrud<T, C = Partial<T>>(endpoint: string) {
  const items = ref<T[]>([])
  const selectedItem = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  async function fetchAll() {
    loading.value = true
    error.value = null
    
    try {
      items.value = await $fetch<T[]>(endpoint)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  async function fetchOne(id: string) {
    loading.value = true
    error.value = null
    
    try {
      selectedItem.value = await $fetch<T>(`${endpoint}/${id}`)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  async function create(data: C) {
    loading.value = true
    error.value = null
    
    try {
      const newItem = await $fetch<T>(endpoint, {
        method: 'POST',
        body: data
      })
      
      items.value.unshift(newItem)
      return newItem
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  // Implementações de update, delete, etc.
  
  return {
    items,
    selectedItem,
    loading,
    error,
    fetchAll,
    fetchOne,
    create,
    // outros métodos...
  }
}
```

### Usando Server API Routes com Services

```typescript
// server/api/posts/index.ts
export default defineEventHandler(async (event) => {
  try {
    const postsService = await getPostsService(event)
    return await postsService.getAllByUser(event.context.user.id)
  } catch (error) {
    handleSupabaseError(error)
  }
})

// server/api/posts/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const postsService = await getPostsService(event)
    return await postsService.create(event.context.user.id, body)
  } catch (error) {
    handleSupabaseError(error)
  }
})
```

### Utilizando Service Role para Operações Privilegiadas

```typescript
// server/services/admin.service.ts
export default class AdminService {
  constructor(private adminClient: SupabaseClient<Database>) {}
  
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await this.adminClient
      .from('users')
      .select('*')
      
    if (error) throw error
    return data
  }
  
  async disableUser(userId: string): Promise<void> {
    const { error } = await this.adminClient
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      
    if (error) throw error
  }
}

// server/api/admin/users.ts
export default defineEventHandler(async (event) => {
  // Verifique permissões de admin
  const user = event.context.user
  
  if (!user?.user_metadata?.is_admin) {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado: permissões de admin necessárias'
    })
  }
  
  try {
    // Use o cliente admin com service role
    const adminClient = await getSupabaseAdmin(event)
    const adminService = new AdminService(adminClient)
    
    return await adminService.getAllUsers()
  } catch (error) {
    handleSupabaseError(error)
  }
})
```

## Compartilhando Tipos e Interfaces

```typescript
// shared/types/models.ts
import type { Database } from './database.types'

// Extrair tipos das tabelas do Supabase
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Post = Database['public']['Tables']['posts']['Row']

// Tipos adicionais para o aplicativo
export interface CreatePostPayload {
  title: string
  content: string
  is_published?: boolean
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}
```

## Práticas com Banco de Dados

### Organização de Esquema

```sql
-- Exemplo de estrutura de esquema
create table public.profiles (
  id uuid references auth.users(id) not null primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Sempre criar índices para campos frequentemente consultados
create index profiles_username_idx on public.profiles(username);
```

### Políticas RLS (Row Level Security)

```sql
-- Ativar RLS
alter table public.profiles enable row level security;

-- Política para leitura pública
create policy "Profiles são visíveis publicamente"
  on public.profiles
  for select
  using (true);

-- Política para atualização apenas pelo próprio usuário
create policy "Usuários podem atualizar apenas seu próprio perfil"
  on public.profiles
  for update
  using (auth.uid() = id);
```

## Autenticação e Middleware

### Proteção de Rotas no Frontend

```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // O módulo Supabase já gerencia redirecionamentos para páginas protegidas
  // Este middleware pode ser usado para lógica adicional
  
  const user = useSupabaseUser()
  
  // Exemplo: verificação adicional para rotas admin
  if (to.path.startsWith('/admin') && !user.value?.user_metadata?.is_admin) {
    return navigateTo('/dashboard')
  }
})
```

## Boas Práticas de Performance

### Otimização de Consultas

```typescript
// server/api/posts/index.ts
export default defineEventHandler(async (event) => {
  const client = serverSupabaseClient(event)
  
  // Limite o número de colunas retornadas
  const { data } = await client
    .from('posts')
    .select('id, title, created_at, author:profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(10)
  
  return data
})
```

### Cache Eficiente

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ...
  nitro: {
    routeRules: {
      // Cache de dados públicos por 5 minutos
      '/api/public/**': { cache: { maxAge: 60 * 5 } },
      // Sem cache para dados privados
      '/api/users/**': { cache: false }
    }
  }
})
```

## Tratamento de Erros

```typescript
// utils/error-handler.ts
export function handleSupabaseError(error: any) {
  // Trate erros do Supabase de forma consistente
  console.error('Erro Supabase:', error)
  
  if (error?.code === 'PGRST116') {
    return 'Erro de política de acesso: Você não tem permissão para acessar este recurso'
  }
  
  return error?.message || 'Ocorreu um erro desconhecido'
}
```

## Tempo Real (Realtime)

```typescript
<script setup lang="ts">
import type { RealtimeChannel } from '@supabase/supabase-js'

const client = useSupabaseClient()
let realtimeChannel: RealtimeChannel

// Reatividade com useAsyncData
const { data: messages, refresh } = await useAsyncData('messages', async () => {
  const { data } = await client.from('messages').select('*').order('created_at')
  return data
})

// Configurar listener de tempo real
onMounted(() => {
  realtimeChannel = client.channel('public:messages').on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'messages' },
    () => refresh()
  )
  
  realtimeChannel.subscribe()
})

// Limpar na desmontagem
onUnmounted(() => {
  client.removeChannel(realtimeChannel)
})
</script>
```

## Conclusão

Seguindo estas boas práticas, você criará aplicações Nuxt + Supabase bem estruturadas, com clara separação de responsabilidades:

1. **Frontend** utiliza composables para estado e UI, mantendo-se focado na experiência do usuário
2. **Backend** contém toda a lógica de negócios, validação e acesso privilegiado aos dados
3. **Tipos compartilhados** garantem consistência entre frontend e backend
4. **Segurança** é reforçada com o uso adequado de RLS e service role

Esta abordagem resulta em aplicações mais seguras, manuteníveis e escaláveis.

## TypeScript e Nuxt: Maximizando a Segurança de Tipos

Como este guia assume o uso 100% de TypeScript em projetos Nuxt, aqui estão práticas adicionais para garantir máxima segurança de tipos:

### Configuração Avançada do TypeScript

No arquivo `tsconfig.json`, configure as opções mais rigorosas para garantir qualidade de código:

```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnreachableCode": false
  }
}
```

### Auto-Imports com Tipos

Aproveite o sistema de auto-imports do Nuxt, mantendo a segurança de tipos:

```typescript
// Importações automáticas do Nuxt (não é necessário importar)
const router = useRouter() // Tipado como Router
const route = useRoute() // Tipado como Route
const nuxtApp = useNuxtApp() // Acesso tipado ao contexto do Nuxt

// Composables com tipos específicos do Supabase
const client = useSupabaseClient<Database>()
const user = useSupabaseUser<User>()
```

### Definição de Composables Tipados

Ao criar composables personalizados, utilize TypeScript para garantir segurança de tipos:

```typescript
// composables/usePosts.ts
import type { Post, CreatePostPayload } from '~/shared/types/models'

export function usePosts() {
  const posts = ref<Post[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  async function fetchUserPosts(): Promise<void> {
    loading.value = true
    try {
      const { data } = await useFetch<{ data: Post[] }>('/api/posts')
      posts.value = data.value?.data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  async function createPost(payload: CreatePostPayload): Promise<Post | null> {
    loading.value = true
    try {
      const { data } = await useFetch<{ data: Post }>('/api/posts', {
        method: 'POST',
        body: payload
      })
      const newPost = data.value?.data
      if (newPost) {
        posts.value = [newPost, ...posts.value]
      }
      return newPost || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro desconhecido'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    posts: readonly(posts),
    loading: readonly(loading),
    error: readonly(error),
    fetchUserPosts,
    createPost
  }
}
```

### Tipagem de Dados de API

Utilize o sistema de tipos para garantir consistência entre frontend e backend:

```typescript
// shared/types/api.ts
import type { Post, User, Comment } from './models'

// Tipagem de respostas de API
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

export type PostsResponse = ApiResponse<Post[]>
export type PostResponse = ApiResponse<Post>
export type UserResponse = ApiResponse<User>

// Tipagem de parâmetros de API
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PostsQueryParams extends PaginationParams {
  orderBy?: 'latest' | 'popular'
  search?: string
  tags?: string[]
}
```

### Tipagem em API Routes do Nuxt

Aproveite o sistema de tipos nas API routes do servidor:

```typescript
// server/api/posts/[id].get.ts
import { z } from 'zod' // Validação com inferência de tipos
import type { PostResponse } from '~/shared/types/api'

// Schema de validação com Zod que infere tipos do TypeScript
const paramsSchema = z.object({
  id: z.string().uuid()
})

export default defineEventHandler<Promise<PostResponse>>(async (event) => {
  try {
    // Validação com inferência de tipos
    const params = paramsSchema.parse(getRouterParams(event))
    
    // Acesso tipado ao serviço
    const postsService = await getPostsService(event)
    const post = await postsService.getById(params.id)
    
    // Retorno tipado
    return { data: post }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Parâmetros inválidos',
        data: error.format()
      })
    }
    
    handleSupabaseError(error)
    throw error
  }
})
```

### Tipos Utilitários para Estados de Interface

Utilize tipos utilitários do TypeScript para gerenciar estados de UI:

```typescript
// shared/types/ui.ts
export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

export interface AsyncState<T> {
  data: T | null
  loading: LoadingState
  error: string | null
}

// Função utilitária para criar estado inicial
export function createInitialState<T>(): AsyncState<T> {
  return {
    data: null,
    loading: 'idle',
    error: null
  }
}

// Em componentes:
const postsState = ref<AsyncState<Post[]>>(createInitialState<Post[]>())
```

### Runtime Type Checking com Zod

Combine o TypeScript com validação em runtime usando Zod:

```typescript
// server/validations/post.ts
import { z } from 'zod'
import type { CreatePostPayload } from '~/shared/types/models'

// Schema que valida e infere tipos
export const createPostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  is_published: z.boolean().optional().default(false)
})

// Tipo inferido do schema
export type ValidatedCreatePostPayload = z.infer<typeof createPostSchema>

// No service
async create(userId: string, payload: CreatePostPayload): Promise<Post> {
  // Validação com inferência de tipos
  const validatedData = createPostSchema.parse(payload)
  
  // Resto do código usando dados validados e tipados
}
```

### Tipagem Estrita para Componentes Vue

Utilize `defineProps` e `defineEmits` com tipos rigorosos:

```vue
<script setup lang="ts">
// Tipagem estrita de props
interface PostCardProps {
  post: Post
  isEditable?: boolean
  showAuthor: boolean
}

const props = defineProps<PostCardProps>()

// Tipagem estrita de eventos
const emit = defineEmits<{
  (e: 'edit', postId: string): void
  (e: 'delete', postId: string): void
  (e: 'view', post: Post): void
}>()

// Tipagem de refs
const isExpanded = ref<boolean>(false)
const commentCount = ref<number>(props.post.comments?.length || 0)
</script>
```

### Extração de Tipos do Supabase

Extraia tipos específicos das definições geradas do Supabase:

```typescript
// shared/types/supabase.ts
import type { Database } from './database.types'

// Tipos de tabelas
export type Tables = Database['public']['Tables']

// Tipos de linhas de tabelas específicas
export type UserRow = Tables['users']['Row']
export type PostRow = Tables['posts']['Row']
export type CommentRow = Tables['comments']['Row']

// Tipos de inserção (para criar novos registros)
export type UserInsert = Tables['users']['Insert']
export type PostInsert = Tables['posts']['Insert']

// Tipos de atualização (para atualizar registros)
export type UserUpdate = Tables['users']['Update']
export type PostUpdate = Tables['posts']['Update']

// Tipos baseados em relacionamentos definidos
export type PostWithComments = PostRow & { comments: CommentRow[] }
export type CommentWithUser = CommentRow & { user: UserRow }
```

Isso garantirá que todas as partes do seu aplicativo Nuxt + Supabase sejam fortemente tipadas, aproveitando ao máximo o sistema de tipos do TypeScript para segurança e produtividade.
