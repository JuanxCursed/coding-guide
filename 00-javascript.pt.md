# Guia de Melhores Práticas JavaScript

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](00-javascript.md)
> - [Português](00-javascript.pt.md)

## Índice

1. [Princípios Fundamentais](#princípios-fundamentais)
2. [Estrutura do Código](#estrutura-do-código)
3. [Padrões de Projeto](#padrões-de-projeto)
4. [Melhores Práticas](#melhores-práticas)

## Princípios Fundamentais

### Clean Code

- Escreva código legível e auto-explicativo
- Use nomes significativos para variáveis e funções
- Mantenha funções pequenas e focadas
- Evite duplicação de código (DRY - Don't Repeat Yourself)
- Mantenha a consistência no estilo de código

### Modularidade

- Divida o código em módulos pequenos e reutilizáveis
- Use ES modules para organizar o código
- Implemente encapsulamento adequado
- Mantenha baixo acoplamento e alta coesão

### Tipagem e Validação

- Use JSDoc para documentação e sugestões de tipo
- Implemente validação de dados de entrada
- Considere usar TypeScript para projetos maiores
- Valide parâmetros de função

## Estrutura do Código

### Organização de Arquivos

```plaintext
src/
├── components/     # Componentes reutilizáveis
├── services/      # Lógica de negócios e chamadas API
├── utils/         # Funções utilitárias
├── constants/     # Constantes e configurações
└── types/         # Definições de tipos (se usar TypeScript)
```

### Convenções de Nomenclatura

- **Arquivos**: Use kebab-case para nomes de arquivo
- **Classes**: Use PascalCase
- **Funções/Variáveis**: Use camelCase
- **Constantes**: Use UPPER_SNAKE_CASE
- **Componentes**: Use PascalCase

## Padrões de Projeto

### Módulos

```javascript
// Bom
export const userService = {
  getUser: async (id) => {
    // implementação
  },
  updateUser: async (user) => {
    // implementação
  }
};

// Ruim
const getUser = async () => {};
const updateUser = async () => {};
export { getUser, updateUser };
```

### Classes

```javascript
class UserManager {
  #privateData;

  constructor() {
    this.#privateData = new Map();
  }

  async getUser(id) {
    if (!id) throw new Error('ID é obrigatório');
    return await this.#fetchUser(id);
  }

  #fetchUser(id) {
    // implementação privada
  }
}
```

### Funções Puras

```javascript
// Bom
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + item.price, 0);
};

// Ruim
let total = 0;
const calculateTotal = (items) => {
  total = 0; // Efeito colateral
  items.forEach(item => total += item.price);
  return total;
};
```

## Melhores Práticas

### Async/Await

```javascript
// Bom
async function fetchUserData(userId) {
  try {
    const user = await userService.getUser(userId);
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

// Ruim
function fetchUserData(userId) {
  return userService.getUser(userId)
    .then(user => user)
    .catch(error => {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    });
}
```

### Tratamento de Erros

```javascript
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
  }
}

const handleError = (error) => {
  if (error instanceof AppError) {
    // Tratamento específico
    return;
  }
  // Tratamento genérico
};
```

### Desestruturação

```javascript
// Bom
const { name, age } = user;
const [first, second] = items;

// Ruim
const name = user.name;
const age = user.age;
const first = items[0];
```

### Operadores Modernos

```javascript
// Nullish coalescing
const value = data ?? defaultValue;

// Optional chaining
const userName = user?.profile?.name;

// Spread operator
const newArray = [...existingArray, newItem];
const newObject = { ...existingObject, newProp: value };
```

### Imutabilidade

```javascript
// Bom
const addItem = (items, newItem) => [...items, newItem];
const removeItem = (items, id) => items.filter(item => item.id !== id);
const updateItem = (items, updatedItem) => items.map(item => 
  item.id === updatedItem.id ? { ...item, ...updatedItem } : item
);

// Ruim
const addItem = (items, newItem) => {
  items.push(newItem); // Mutação direta
  return items;
};
```

### Performance

```javascript
// Bom - Memoização
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// Bom - Debounce
const debouncedSearch = debounce((searchTerm) => {
  // Implementação da busca
}, 300);

// Bom - Throttle
const throttledScroll = throttle(() => {
  // Implementação do scroll
}, 100);
```

### Testes

```javascript
describe('UserService', () => {
  it('deve retornar usuário quando ID válido', async () => {
    const user = await userService.getUser('valid-id');
    expect(user).toBeDefined();
    expect(user.id).toBe('valid-id');
  });

  it('deve lançar erro quando ID inválido', async () => {
    await expect(userService.getUser('')).rejects.toThrow('ID é obrigatório');
  });
});
``` 