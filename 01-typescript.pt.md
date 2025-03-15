# Guia de Melhores Práticas TypeScript

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](01-typescript.md)
> - [Português](01-typescript.pt.md)

## Índice

1. [Configuração do Projeto](#configuração-do-projeto)
2. [Tipos e Interfaces](#tipos-e-interfaces)
3. [Padrões de Projeto](#padrões-de-projeto)
4. [Melhores Práticas](#melhores-práticas)

## Configuração do Projeto

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### Estrutura de Diretórios

```plaintext
src/
├── types/         # Definições de tipos globais
├── interfaces/    # Interfaces compartilhadas
├── models/        # Classes e tipos de domínio
├── services/      # Lógica de negócios
├── utils/         # Funções utilitárias
└── constants/     # Constantes e enums
```

## Tipos e Interfaces

### Definição de Tipos

```typescript
// Tipos Básicos
type ID = string | number;
type Status = 'active' | 'inactive' | 'pending';
type Callback<T> = (data: T) => void;

// Interfaces
interface User {
  id: ID;
  name: string;
  email: string;
  status: Status;
  createdAt: Date;
}

// Extensão de Interfaces
interface AdminUser extends User {
  permissions: string[];
  role: 'admin' | 'superadmin';
}

// Tipos Utilitários
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

### Generics

```typescript
// Função Genérica
function getFirst<T>(array: T[]): T | undefined {
  return array[0];
}

// Classe Genérica
class DataService<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return [...this.items];
  }
}

// Interface Genérica
interface Repository<T> {
  find(id: string): Promise<T>;
  save(item: T): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## Padrões de Projeto

### Singleton

```typescript
export class Database {
  private static instance: Database;
  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

### Factory

```typescript
interface Product {
  name: string;
  price: number;
}

class ProductFactory {
  static createProduct(type: 'basic' | 'premium', name: string): Product {
    switch (type) {
      case 'basic':
        return { name, price: 100 };
      case 'premium':
        return { name, price: 200 };
      default:
        throw new Error('Tipo de produto inválido');
    }
  }
}
```

### Repository

```typescript
interface UserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<void>;
}

class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User> {
    // Implementação
    return {} as User;
  }

  async save(user: User): Promise<void> {
    // Implementação
  }
}
```

## Melhores Práticas

### Tipagem Estrita

```typescript
// Bom
function calculateTotal(items: readonly Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}

// Ruim
function calculateTotal(items: any[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}
```

### Discriminated Unions

```typescript
type Success<T> = {
  type: 'success';
  data: T;
};

type Error = {
  type: 'error';
  error: string;
};

type Result<T> = Success<T> | Error;

function handleResult<T>(result: Result<T>): void {
  switch (result.type) {
    case 'success':
      console.log(result.data);
      break;
    case 'error':
      console.error(result.error);
      break;
  }
}
```

### Null Safety

```typescript
// Bom
function getUser(id: string): Promise<User | null> {
  // Implementação
}

async function processUser(id: string): Promise<void> {
  const user = await getUser(id);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  // Agora TypeScript sabe que user não é null
  console.log(user.name);
}

// Ruim
function processUser(user: User | null): void {
  // @ts-ignore
  console.log(user.name); // Pode causar erro em runtime
}
```

### Type Guards

```typescript
interface Admin {
  role: 'admin';
  adminPermissions: string[];
}

interface User {
  role: 'user';
  userPreferences: string[];
}

function isAdmin(user: Admin | User): user is Admin {
  return user.role === 'admin';
}

function handleUser(user: Admin | User): void {
  if (isAdmin(user)) {
    console.log(user.adminPermissions);
  } else {
    console.log(user.userPreferences);
  }
}
```

### Async/Await com Tipos

```typescript
async function fetchData<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url);
    const data: T = await response.json();
    return { type: 'success', data };
  } catch (error) {
    return { type: 'error', error: error.message };
  }
}

// Uso
interface UserData {
  id: string;
  name: string;
}

const result = await fetchData<UserData>('/api/user');
if (result.type === 'success') {
  console.log(result.data.name);
}
```

### Decorators

```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args: any[]) {
    console.log(`Chamando ${propertyKey} com argumentos:`, args);
    const result = await originalMethod.apply(this, args);
    console.log(`${propertyKey} retornou:`, result);
    return result;
  };

  return descriptor;
}

class UserService {
  @log
  async getUser(id: string): Promise<User> {
    // Implementação
    return {} as User;
  }
}
```

### Testes

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('deve retornar usuário quando ID válido', async () => {
    const user = await service.getUser('valid-id');
    expect(user).toBeDefined();
    expect(user.id).toBe('valid-id');
  });

  it('deve lançar erro quando ID inválido', async () => {
    await expect(service.getUser('')).rejects.toThrow('ID inválido');
  });
});
``` 