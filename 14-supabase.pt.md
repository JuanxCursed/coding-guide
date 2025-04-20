# Guia de Melhores Práticas Supabase

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](04-supabase.md)
> - [Português](04-supabase.pt.md)

## Índice

1. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
2. [Autenticação](#autenticação)
3. [Segurança](#segurança)
4. [Storage](#storage)
5. [Edge Functions](#edge-functions)
6. [Melhores Práticas](#melhores-práticas)

## Estrutura do Banco de Dados

### Schema e Tabelas

```sql
-- schemas/public/tables/users.sql
create table public.users (
  id uuid default extensions.uuid_generate_v4() primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- schemas/public/tables/profiles.sql
create table public.profiles (
  id uuid references public.users(id) on delete cascade primary key,
  username text unique not null,
  bio text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger para updated_at
create trigger handle_updated_at before update on public.users
  for each row execute procedure extensions.moddatetime (updated_at);
```

### Políticas RLS

```sql
-- Políticas para users
alter table public.users enable row level security;

create policy "Usuários podem ver seus próprios dados"
  on public.users for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar seus próprios dados"
  on public.users for update
  using (auth.uid() = id);

-- Políticas para profiles
alter table public.profiles enable row level security;

create policy "Perfis são públicos"
  on public.profiles for select
  using (true);

create policy "Usuários podem atualizar seus próprios perfis"
  on public.profiles for update
  using (auth.uid() = id);
```

### Funções e Triggers

```sql
-- functions/handle_new_user.sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para criar perfil automaticamente
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Autenticação

### Setup do Cliente

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// types/supabase.ts
export type Tables = Database['public']['Tables']
export type Users = Tables['users']['Row']
export type Profiles = Tables['profiles']['Row']
```

### Autenticação de Usuário

```typescript
// composables/useAuth.ts
export function useAuth() {
  const user = ref<User | null>(null)
  const loading = ref(true)

  // Ouvir mudanças de autenticação
  onMounted(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        user.value = session?.user ?? null
        loading.value = false
      }
    )

    // Cleanup
    onUnmounted(() => subscription.unsubscribe())
  })

  async function signIn(credentials: SignInCredentials) {
    const { error } = await supabase.auth.signInWithPassword(credentials)
    if (error) throw error
  }

  async function signUp(credentials: SignUpCredentials) {
    const { error } = await supabase.auth.signUp(credentials)
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}
```

### Provedores OAuth

```typescript
// composables/useOAuth.ts
export function useOAuth() {
  async function signInWithProvider(provider: Provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw error
  }

  return {
    signInWithProvider
  }
}

// pages/auth/callback.vue
const route = useRoute()
const { error } = await supabase.auth.exchangeCodeForSession(
  route.query.code as string
)
```

## Segurança

### Políticas RLS Avançadas

```sql
-- Políticas com joins
create policy "Usuários podem ver posts de quem seguem"
  on public.posts for select
  using (
    auth.uid() in (
      select follower_id
      from public.follows
      where following_id = posts.user_id
    )
  );

-- Políticas com funções
create function public.is_post_owner(post_id uuid)
returns boolean as $$
  select exists (
    select 1
    from public.posts
    where id = post_id
      and user_id = auth.uid()
  );
$$ language sql security definer;

create policy "Usuários podem deletar seus próprios posts"
  on public.posts for delete
  using (public.is_post_owner(id));
```

### Validação de Dados

```typescript
// schemas/validation.ts
import { z } from 'zod'

export const UserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2).max(100),
  avatar_url: z.string().url().optional()
})

// composables/useUser.ts
export function useUser() {
  async function updateUser(data: UpdateUserData) {
    // Validar dados
    const validated = UserSchema.parse(data)

    const { error } = await supabase
      .from('users')
      .update(validated)
      .eq('id', user.value.id)

    if (error) throw error
  }

  return {
    updateUser
  }
}
```

### Middleware de Autenticação

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { user } = useAuth()
  
  // Verificar sessão do servidor
  if (process.server) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session && to.path !== '/login') {
      return navigateTo('/login')
    }
  }
  
  // Verificar sessão do cliente
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

## Storage

### Upload de Arquivos

```typescript
// composables/useStorage.ts
export function useStorage(bucket: string) {
  async function upload(path: string, file: File) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
    if (error) throw error
  }

  function getPublicUrl(path: string) {
    return supabase.storage
      .from(bucket)
      .getPublicUrl(path)
      .data.publicUrl
  }

  async function remove(path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    if (error) throw error
  }

  return {
    upload,
    getPublicUrl,
    remove
  }
}

// Uso
const { upload, getPublicUrl } = useStorage('avatars')

async function updateAvatar(file: File) {
  const path = `${user.value.id}/${file.name}`
  await upload(path, file)
  const url = getPublicUrl(path)
  
  await supabase
    .from('users')
    .update({ avatar_url: url })
    .eq('id', user.value.id)
}
```

### Políticas de Storage

```sql
-- Políticas para bucket 'avatars'
create policy "Avatar público para leitura"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Usuários podem fazer upload de avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Usuários podem atualizar seus avatares"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );
```

## Edge Functions

### Estrutura de Edge Function

```typescript
// supabase/functions/process-image/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

serve(async (req) => {
  // Verificar método OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Processar requisição
    const { image_url } = await req.json()
    const processedUrl = await processImage(image_url)

    // Retornar resposta
    return new Response(
      JSON.stringify({ url: processedUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### Invocação de Edge Function

```typescript
// composables/useEdgeFunction.ts
export function useEdgeFunction() {
  async function invoke<T = any>(
    functionName: string,
    payload?: any
  ): Promise<T> {
    const { data, error } = await supabase.functions.invoke<T>(
      functionName,
      {
        body: payload
      }
    )
    
    if (error) throw error
    return data
  }

  return {
    invoke
  }
}

// Uso
const { invoke } = useEdgeFunction()

async function processUserAvatar(url: string) {
  const { url: processedUrl } = await invoke('process-image', {
    image_url: url
  })
  return processedUrl
}
```

## Melhores Práticas

### Tipos Fortemente Tipados

```typescript
// types/database.ts
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          full_name?: string
          avatar_url?: string
        }
        Update: {
          email?: string
          full_name?: string
          avatar_url?: string
        }
      }
      // ... outras tabelas
    }
    Functions: {
      is_post_owner: {
        Args: { post_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'user'
    }
  }
}
```

### Gerenciamento de Cache

```typescript
// composables/useQueryCache.ts
export function useQueryCache<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function fetch(force = false) {
    if (data.value && !force) return data.value
    
    loading.value = true
    error.value = null
    
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
    
    return data.value
  }

  return {
    data,
    error,
    loading,
    fetch
  }
}

// Uso
const { data, fetch } = useQueryCache(
  'users',
  () => supabase.from('users').select('*')
)
```

### Subscrições em Tempo Real

```typescript
// composables/useRealtimeSubscription.ts
export function useRealtimeSubscription<T = any>(
  channel: string,
  callback: (payload: T) => void
) {
  const subscription = supabase
    .channel(channel)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload) => callback(payload as T)
    )
    .subscribe()

  onUnmounted(() => {
    subscription.unsubscribe()
  })

  return {
    subscription
  }
}

// Uso
const messages = ref<Message[]>([])

useRealtimeSubscription<Message>(
  'messages',
  (payload) => {
    if (payload.eventType === 'INSERT') {
      messages.value.push(payload.new)
    }
  }
)
```

### Testes

```typescript
// tests/database.test.ts
import { createClient } from '@supabase/supabase-js'
import { expect, it, beforeEach } from 'vitest'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

beforeEach(async () => {
  // Limpar dados de teste
  await supabase.from('users').delete().neq('id', 'system')
})

it('deve criar um perfil ao criar usuário', async () => {
  const { data: user } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'password123'
  })

  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.user?.id)
    .single()

  expect(profile).toBeDefined()
  expect(profile.username).toBe('test@example.com')
})
```

### Migrações

```sql
-- migrations/0001_create_users.sql
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- migrations/0002_create_profiles.sql
create table public.profiles (
  id uuid references public.users(id) on delete cascade primary key,
  username text unique not null,
  bio text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- seed.sql
insert into public.users (id, email, full_name)
values
  ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Admin User');
``` 