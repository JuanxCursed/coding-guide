# TypeScript: Best Practices Guide

## TypeScript: Best Practices

### 1. Type Everything Explicitly

```typescript
// ✅ GOOD
const user: User = { id: 1, name: 'John' };
const getUserById = (id: number): User | undefined => { /* ... */ };

// ❌ BAD
const user = { id: 1, name: 'John' };
function getUserById(id) { /* ... */ }
```

### 2. Interfaces vs. Types

Use interfaces to define objects and types for more complex types:

```typescript
// Para objetos (preferir interfaces)
interface User {
  id: number;
  name: string;
  email: string;
}

// Para tipos complexos (unions, intersections)
type UserRole = 'admin' | 'editor' | 'viewer';
type UserWithRole = User & { role: UserRole };
```

### 3. Organização de Tipos

Mantenha seus tipos em arquivos dedicados:

```typescript
// shared/types/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';
```

## Recursos Modernos de Tipagem TypeScript

### Tipos Utilitários

```typescript
// Tipos utilitários incorporados
type ReadonlyUser = Readonly<User>; // Torna todas as propriedades somente leitura
type PartialUser = Partial<User>; // Torna todas as propriedades opcionais
type RequiredUser = Required<User>; // Torna todas as propriedades obrigatórias
type PickedUser = Pick<User, 'id' | 'name'>; // Seleciona apenas as propriedades especificadas
type OmittedUser = Omit<User, 'email'>; // Omite as propriedades especificadas

// Extraindo propriedades de um tipo
type UserKeys = keyof User; // 'id' | 'name' | 'email'

// Record para mapear chaves para um tipo
type UserRolePermissions = Record<UserRole, string[]>;
// Equivalente a:
// { 
//   admin: string[], 
//   editor: string[], 
//   viewer: string[]
// }

// Mapeando tipos
type Nullable<T> = { [P in keyof T]: T[P] | null };
type NullableUser = Nullable<User>; // Todas as propriedades podem ser null
```

### Tipos Condicionais

```typescript
// Tipos condicionais básicos
type IsString<T> = T extends string ? true : false;

// Uso prático em funções genéricas
type ArrayOrSingle<T> = T extends any[] ? T : T[];

// Função que aceita item único ou array e sempre retorna array
function ensureArray<T>(input: T): ArrayOrSingle<T> {
  return Array.isArray(input) ? input : [input] as ArrayOrSingle<T>;
}

// Tipos condicionais com inferência
type UnpackPromise<T> = T extends Promise<infer U> ? U : T;
// Exemplo: UnpackPromise<Promise<number>> = number

// Tipos complexos condicionais
type UserResponse<T extends boolean> = T extends true 
  ? { users: User[]; total: number } // com metadados
  : User[]; // apenas array de usuários

function getUsers<T extends boolean>(withMeta: T): UserResponse<T> {
  if (withMeta) {
    return { 
      users: [{ id: 1, name: 'João', email: 'joao@example.com' }], 
      total: 1 
    } as UserResponse<T>;
  }
  return [{ id: 1, name: 'João', email: 'joao@example.com' }] as UserResponse<T>;
}

const usersWithMeta = getUsers(true); // tipo: { users: User[]; total: number }
const usersOnly = getUsers(false); // tipo: User[]
```

### Template Literal Types

```typescript
// Template literal types básicos
type EventName = `user:${string}`;
// Possíveis valores incluem: 'user:created', 'user:updated', etc.

// Template literals com unions
type UserEvent = `user:${'created' | 'updated' | 'deleted'}`;
// Tipo exato: 'user:created' | 'user:updated' | 'user:deleted'

// Template literals para chaves de propriedades
type CSSProperties = `--${string}`;
// Para variáveis CSS personalizadas: '--primary-color', '--font-size', etc.

// Template literals com união de múltiplos tipos
type Coordinate = `${number},${number}`;
// Ex: '10,20', '0,0', '-5.5,3.14'

// Uso prático com tipos de ações para gerenciamento de estado
type EntityTypes = 'user' | 'post' | 'comment';
type ActionTypes = 'fetch' | 'create' | 'update' | 'delete';
type ActionName = `${EntityTypes}/${ActionTypes}`;
// Resulta em: 'user/fetch' | 'user/create' | 'post/update' | etc.
```

### Inferência de Tipos

```typescript
// Inferência a partir de constantes
const userStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked'
} as const;

// Extrai o tipo de valores: 'active' | 'inactive' | 'blocked'
type UserStatus = typeof userStatus[keyof typeof userStatus];

// Inferência de tipos a partir de arrays
const roles = ['admin', 'editor', 'viewer'] as const;
type Role = typeof roles[number]; // 'admin' | 'editor' | 'viewer'

// Inferência de funções
const createUser = (name: string, email: string) => ({ name, email, createdAt: new Date() });
type User = ReturnType<typeof createUser>; // { name: string; email: string; createdAt: Date }

// Inferência com métodos de classe
class API {
  getUsers() { return Promise.resolve([{ id: 1, name: 'João' }]); }
}
type Users = Awaited<ReturnType<API['getUsers']>>; // User[]

// Inferência de parâmetros de função
type FirstParameter<T> = T extends (arg1: infer P, ...args: any[]) => any ? P : never;
function handler(x: number, y: string) { return x + y; }
type FirstArg = FirstParameter<typeof handler>; // number
```

## Dicas e Boas Práticas

1. **Utilize `as const` para literais e arrays de valores fixos**

```typescript
// Com as const, TypeScript entende os valores exatos, não apenas os tipos
const PERMISSIONS = ['read', 'write', 'admin'] as const;
// Tipo: readonly ['read', 'write', 'admin']

// Sem as const
const LOOSE_PERMISSIONS = ['read', 'write', 'admin'];
// Tipo: string[]
```

2. **Prefira discriminated unions para modelar estados**

```typescript
// Modelando estados de uma operação assíncrona
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// Uso
function renderContent<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return <Placeholder />;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <DataView data={state.data} />; // TypeScript sabe que data existe aqui
    case 'error':
      return <ErrorMessage message={state.error.message} />; // TypeScript sabe que error existe aqui
  }
}
```

3. **Use assertion functions para estreitar tipos em runtime**

```typescript
// Função de asserção que verifica se um valor não é nulo ou indefinido
function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(`Expected value to be defined, but got ${value}`);
  }
}

// Uso
function processUser(user: User | null) {
  assertIsDefined(user); // A partir daqui, TypeScript sabe que user não é null
  console.log(user.name); // Não precisa de verificação de null
}
```

4. **Defina tipos para objetos de configuração e parâmetros**

```typescript
// Definir interface para objetos de configuração
interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Uso da interface para parâmetros de função
function fetchUsers(options: PaginationOptions): Promise<User[]> {
  // Implementação
  return Promise.resolve([]);
}

// Chamada com objeto que segue a interface
fetchUsers({ page: 1, limit: 10, sortBy: 'name', sortDirection: 'asc' });
```

5. **Use genéricos para códigos reutilizáveis e flexíveis**

```typescript
// API genérica para qualquer tipo de entidade
async function fetchEntity<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/${endpoint}`);
  return response.json();
}

// Uso com tipos específicos
const user = await fetchEntity<User>('users/1');
const post = await fetchEntity<Post>('posts/1');

// Componente genérico que pode lidar com vários tipos
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

6. **Defina tipos de retorno para funções explicitamente**

```typescript
// ✅ GOOD: Tipo de retorno explícito
function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ❌ BAD: Tipo de retorno inferido (pode mudar inesperadamente)
function calculateTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
```

7. **Utilize tipo de índice em vez de `any` para objetos dinâmicos**

```typescript
// ✅ GOOD: Usando Record para tipagem de objeto dinâmico
function countOccurrences(items: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    result[item] = (result[item] || 0) + 1;
  }
  return result;
}

// ✅ MELHOR: Tipo de índice com mais controle
interface Dictionary<T> {
  [key: string]: T;
}

function countOccurrences(items: string[]): Dictionary<number> {
  const result: Dictionary<number> = {};
  for (const item of items) {
    result[item] = (result[item] || 0) + 1;
  }
  return result;
}
```

8. **Use enums apenas quando necessário, prefira union types ou constantes**

```typescript
// ❌ MENOS RECOMENDADO: Enum tradicional (gera código JavaScript)
enum UserRole {
  Admin = 'ADMIN',
  Editor = 'EDITOR',
  Viewer = 'VIEWER'
}

// ✅ RECOMENDADO: Union type com as const
const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Uso
function hasPermission(role: UserRole) {
  if (role === USER_ROLES.ADMIN) {
    return true;
  }
  // ...
}
```

## Improving Conditionals with Type Predicates and Variables

TypeScript offers powerful ways to make conditionals more expressive and type-safe:

```typescript
// Using type predicates for clearer type checking
interface User {
  id: number;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Type predicate function
function isAdminUser(user: User): user is AdminUser {
  return user.role === 'admin';
}

// Using the predicate in conditionals
function handleUser(user: User) {
  if (isAdminUser(user)) {
    // TypeScript knows user is AdminUser here
    console.log(user.permissions); // No type error
  } else {
    // TypeScript knows user is not AdminUser here
    // console.log(user.permissions); // Would cause a type error
  }
}

// Using descriptive variables for complex conditions
function canEditContent(user: User, content: Content): boolean {
  // Bad - complex conditions inline
  if (
    (user.role === 'admin' || 
     (user.role === 'editor' && content.ownerId === user.id)) && 
    !content.isArchived && 
    content.status !== 'review'
  ) {
    return true;
  }
  return false;

  // Good - descriptive variables
  const isAdmin = user.role === 'admin';
  const isEditor = user.role === 'editor';
  const isOwner = content.ownerId === user.id;
  const isNotArchived = !content.isArchived;
  const isNotUnderReview = content.status !== 'review';
  
  const hasAdminAccess = isAdmin;
  const hasEditorAccess = isEditor && isOwner;
  const hasRequiredAccess = hasAdminAccess || hasEditorAccess;
  const isContentEditable = isNotArchived && isNotUnderReview;
  
  return hasRequiredAccess && isContentEditable;
}

// Using enums and constants for boundary conditions
enum TemperatureLevel {
  Cold = 'cold',
  Moderate = 'moderate',
  Warm = 'warm',
  Hot = 'hot'
}

const TEMPERATURE_THRESHOLDS = {
  COLD: 0,
  MODERATE: 15,
  WARM: 25,
  HOT: 30
} as const;

function getTemperatureLevel(celsius: number): TemperatureLevel {
  // Bad - hardcoded magic numbers
  if (celsius < 0) return TemperatureLevel.Cold;
  if (celsius < 15) return TemperatureLevel.Cold;
  if (celsius < 25) return TemperatureLevel.Moderate;
  if (celsius < 30) return TemperatureLevel.Warm;
  return TemperatureLevel.Hot;
  
  // Good - named constants
  if (celsius < TEMPERATURE_THRESHOLDS.COLD) return TemperatureLevel.Cold;
  if (celsius < TEMPERATURE_THRESHOLDS.MODERATE) return TemperatureLevel.Cold;
  if (celsius < TEMPERATURE_THRESHOLDS.WARM) return TemperatureLevel.Moderate;
  if (celsius < TEMPERATURE_THRESHOLDS.HOT) return TemperatureLevel.Warm;
  return TemperatureLevel.Hot;
}

// Using interfaces to make permission checks more readable
interface UserPermissions {
  canViewContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canInviteUsers: boolean;
  canManageRoles: boolean;
}

// Helper function to calculate user permissions
function getUserPermissions(user: User): UserPermissions {
  const isAdmin = user.role === 'admin';
  const isEditor = user.role === 'editor';
  
  return {
    canViewContent: true, // All users can view
    canEditContent: isAdmin || isEditor,
    canDeleteContent: isAdmin,
    canInviteUsers: isAdmin,
    canManageRoles: isAdmin
  };
}

// Now conditionals become much clearer
function renderUI(user: User, content: Content) {
  const permissions = getUserPermissions(user);
  
  // Much more readable conditional checks
  if (permissions.canEditContent) {
    renderEditButton();
  }
  
  if (permissions.canDeleteContent) {
    renderDeleteButton();
  }
}

// Using object literals instead of complex if/else chains
type ActionType = 'create' | 'update' | 'delete' | 'view';

// Bad - complex if/else structure
function getPermissionMessage(action: ActionType, user: User): string {
  if (action === 'create') {
    if (user.role === 'admin' || user.role === 'editor') {
      return 'You can create content';
    } else {
      return 'You cannot create content';
    }
  } else if (action === 'update') {
    if (user.role === 'admin') {
      return 'You can update any content';
    } else if (user.role === 'editor') {
      return 'You can update your own content';
    } else {
      return 'You cannot update content';
    }
  }
  // ...and so on
}

// Good - using object literals with descriptive keys
function getPermissionMessage(action: ActionType, user: User): string {
  const isAdmin = user.role === 'admin';
  const isEditor = user.role === 'editor';
  
  const messages = {
    create: {
      allowed: isAdmin || isEditor,
      message: () => isAdmin || isEditor ? 'You can create content' : 'You cannot create content'
    },
    update: {
      allowed: isAdmin || isEditor,
      message: () => {
        if (isAdmin) return 'You can update any content';
        if (isEditor) return 'You can update your own content';
        return 'You cannot update content';
      }
    },
    delete: {
      allowed: isAdmin,
      message: () => isAdmin ? 'You can delete content' : 'You cannot delete content'
    },
    view: {
      allowed: true,
      message: () => 'You can view content'
    }
  };
  
  return messages[action].message();
}
```

The TypeScript type system can help you make your conditional logic more expressive and self-documenting by:

1. Using **type predicates** to narrow types in conditional branches
2. Creating **clear variable names** for complex conditions
3. Defining **enums and constants** for boundary values
4. Using **interfaces** to group related properties for permission checks
5. Using **object literals** to replace complex if/else chains 