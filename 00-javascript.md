# JavaScript: Best Practices Guide

## Code Style

```javascript
// Arrow functions instead of traditional functions
const doSomething = (param1, param2) => {
  // code
};

// Destructuring for clarity
const { name, email } = user;

// Template literals for strings
const message = `Hello, ${user.name}!`;

// Array/Object methods instead of loops
const filteredUsers = users.filter(user => user.active);

// Async/await instead of .then()
const fetchData = async () => {
  try {
    const result = await api.get('/data');
    return result;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Ternários para lógica simples
const status = user.active ? 'Ativo' : 'Inativo';
```

## Modern JavaScript Syntax

### 1. Arrow Functions

```javascript
// ✅ BOM: Arrow functions
const multiply = (a, b) => a * b;

// Para funções de uma linha, omita o return
const double = x => x * 2;

// Para funções maiores, use chaves
const processUser = user => {
  const { id, name } = user;
  return {
    id,
    name,
    formattedName: name.toUpperCase(),
    timestamp: Date.now()
  };
};
```

### 2. Spread and Rest Operators

```javascript
// Spread for objects
const userWithDefaults = { ...defaultUser, ...userData };

// Spread for arrays
const allItems = [...previousItems, ...newItems];

// Rest parameters
const sum = (...numbers) => 
  numbers.reduce((total, num) => total + num, 0);

// Destructuring with rest
const { id, name, ...otherProps } = user;
```

### 3. Advanced Destructuring

```javascript
// Destructuring with default values
const { name = 'Anônimo', age = 0 } = user;

// Nested destructuring
const { 
  address: { street, city = 'Desconhecido' } 
} = userProfile;

// Destructuring in function parameters
const getUserInfo = ({ id, name, email }) => 
  `ID: ${id}, Nome: ${name}, Email: ${email}`;

// Destructuring with renaming
const { name: userName, id: userId } = user;
```

### 4. Nullish Coalescing and Optional Chaining

```javascript
// Nullish coalescing (??)
const displayName = user.name ?? 'Usuário sem nome';

// Nullish coalescing for specific falsy values
const count = userCount ?? 0; // only null/undefined trigger fallback

// Optional chaining
const city = user?.address?.city;
const zip = user?.address?.zipcode ?? 'Sem CEP';

// Optional chaining with methods
const upperName = user?.name?.toUpperCase?.() ?? 'SEM NOME';

// Optional chaining with indexing
const firstTag = user?.tags?.[0];
```

### 5. Pattern Matching and Modern Control Flow

```javascript
// Switch with clearer expressions
const getUserRole = (user) => {
  switch (user.type) {
    case 'admin':
      return 'Administrador';
    case 'editor':
      return 'Editor';
    default:
      return 'Visitante';
  }
};

// Object literal as alternative to switch
const roleNames = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visitante'
};

const getUserRoleName = (role) => roleNames[role] || 'Desconhecido';

// Encadeamento de map/filter/reduce
const activeUserNames = users
  .filter(user => user.active)
  .map(user => user.name)
  .filter(name => name.length > 3);
```

### 6. Modern Class Features

```javascript
// Class properties
class UserService {
  apiClient;
  
  // Constructor parameters
  constructor(config) {
    this.apiClient = new HttpApiClient(config.baseUrl);
    this.config = config;
  }
  
  // Class methods
  async getUser(id) {
    return this.apiClient.get(`/users/${id}`);
  }
  
  // Static methods
  static createGuestUser() {
    return { id: 0, name: 'Guest', role: 'viewer' };
  }
  
  // Getters and setters
  get baseUrl() {
    return this.config.baseUrl;
  }
  
  set baseUrl(url) {
    this.config.baseUrl = url;
    this.apiClient = new HttpApiClient(url);
  }
}
```

## Proper Comparisons in Conditionals

```javascript
// Use strict equality (===) instead of loose equality (==)
// Good
if (value === 0) {
  console.log('Value is zero');
}

// Bad - can lead to unexpected results due to type coercion
if (value == 0) {
  console.log('Value could be 0, "", false, null, etc.');
}

// Explicitly check for null and undefined
// Good
if (value === null || value === undefined) {
  console.log('Value is null or undefined');
}

// Better
if (value == null) {
  console.log('Value is null or undefined'); // == handles both cases
}

// Even better (modern)
if (value === undefined) {
  console.log('Value is undefined');
}

if (value === null) {
  console.log('Value is null');
}

// Check for empty arrays or strings
// Good
if (array.length === 0) {
  console.log('Array is empty');
}

if (string === '') {
  console.log('String is empty');
}

// Cleaner (but be aware of falsy values like 0)
if (!array.length) {
  console.log('Array is empty');
}

// Checking for existence in objects
// Good
if (Object.prototype.hasOwnProperty.call(obj, 'property')) {
  console.log('Property exists on the object itself');
}

// Better (modern)
if ('property' in obj) {
  console.log('Property exists in the object or its prototype chain');
}

// Best (modern)
if (obj?.property !== undefined) {
  console.log('Property exists and is not undefined');
}

// Using variables for complex conditions to improve readability
// Bad - complex condition directly in if statement
if (user.age >= 18 && user.isVerified && !user.isBanned && user.subscription.status === 'active') {
  allowAccess();
}

// Good - using descriptive variables to explain the conditions
const isAdult = user.age >= 18;
const isVerified = user.isVerified === true;
const isNotBanned = !user.isBanned;
const hasActiveSubscription = user.subscription.status === 'active';

if (isAdult && isVerified && isNotBanned && hasActiveSubscription) {
  allowAccess();
}

// Even better - wrap complex conditions in functions with descriptive names
const canAccessContent = (user) => {
  const isAdult = user.age >= 18;
  const isVerified = user.isVerified === true;
  const isNotBanned = !user.isBanned;
  const hasActiveSubscription = user.subscription.status === 'active';
  
  return isAdult && isVerified && isNotBanned && hasActiveSubscription;
};

if (canAccessContent(user)) {
  allowAccess();
}

// Using variables for boundary conditions
// Bad - magic numbers
if (temperature > 30) {
  showHeatWarning();
}

// Good - named constants
const HIGH_TEMPERATURE_THRESHOLD = 30;

if (temperature > HIGH_TEMPERATURE_THRESHOLD) {
  showHeatWarning();
}

// Using variables for business logic clarity
// Bad - unclear price comparison
if (price * quantity < 100) {
  applyDiscount();
}

// Good - clear business logic
const orderTotal = price * quantity;
const DISCOUNT_THRESHOLD = 100;
const isEligibleForDiscount = orderTotal < DISCOUNT_THRESHOLD;

if (isEligibleForDiscount) {
  applyDiscount();
}

// For date/time comparisons
// Bad - obscure time calculation
if (Date.now() - user.lastLoginTimestamp > 1000 * 60 * 60 * 24 * 30) {
  promptForRelogin();
}

// Good - clear time variables
const THIRTY_DAYS_IN_MS = 1000 * 60 * 60 * 24 * 30;
const timeSinceLastLogin = Date.now() - user.lastLoginTimestamp;
const isLoginExpired = timeSinceLastLogin > THIRTY_DAYS_IN_MS;

if (isLoginExpired) {
  promptForRelogin();
}
```

## Advanced Loops and Iterations

```javascript
// Traditional for loop (use when you need the index)
for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}

// For...of loop (cleaner for arrays, iterables)
for (const item of items) {
  console.log(item);
}

// For...in loop (for object properties)
for (const key in object) {
  if (Object.prototype.hasOwnProperty.call(object, key)) {
    console.log(`${key}: ${object[key]}`);
  }
}

// Array methods (preferred for most cases)
// forEach when you need to perform an operation
items.forEach((item, index) => {
  console.log(`Item ${index}: ${item}`);
});

// map when you need to transform data
const doubledValues = items.map(item => item * 2);

// filter when you need to select items
const positiveValues = items.filter(item => item > 0);

// reduce when you need to aggregate data
const sum = items.reduce((total, item) => total + item, 0);

// find when you need the first match
const firstEven = items.find(item => item % 2 === 0);

// some when you need to check if at least one item matches
const hasNegatives = items.some(item => item < 0);

// every when you need to check if all items match
const allPositive = items.every(item => item > 0);

// Chaining array methods (read from left to right)
const result = items
  .filter(item => item > 0)
  .map(item => item * 2)
  .reduce((sum, item) => sum + item, 0);

// Breaking loops early
for (const item of items) {
  if (item.isSpecial) {
    console.log('Found special item!');
    break; // Exit loop
  }
}

// Skipping iterations
for (const item of items) {
  if (item.shouldSkip) {
    continue; // Skip to next iteration
  }
  processItem(item);
}
```

## String Interpolation and Formatting

```javascript
// Template literals (preferred)
const name = 'Alice';
const age = 30;
const greeting = `Hello, ${name}! You are ${age} years old.`;

// String interpolation with expressions
const isAdult = age >= 18;
const message = `${name} is ${isAdult ? 'an adult' : 'a minor'}.`;

// Multiline strings with template literals
const multilineText = `This is a
multiline string that preserves
line breaks and indentation.`;

// Complex expressions in template literals
const total = 123.45;
const tax = 10.5;
const invoice = `
  Invoice Summary:
  ----------------
  Subtotal: $${total.toFixed(2)}
  Tax (${tax}%): $${(total * tax / 100).toFixed(2)}
  Total: $${(total + total * tax / 100).toFixed(2)}
`;

// Tagged templates for custom formatting
function currency(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i - 1];
    const formatted = typeof value === 'number' 
      ? `$${value.toFixed(2)}` 
      : value;
    return result + formatted + str;
  });
}

const price = 29.99;
const formattedPrice = currency`The item costs ${price}`;
// Result: "The item costs $29.99"

// Common template literal use cases
const url = `https://api.example.com/users/${userId}?filter=${encodeURIComponent(filter)}`;
const cssClass = `card ${isActive ? 'active' : ''} ${hasError ? 'error' : ''}`.trim();
const html = `
  <div class="user-card">
    <h2>${escapeHtml(user.name)}</h2>
    <p>${escapeHtml(user.bio)}</p>
    ${user.isVerified ? '<span class="verified-badge">✓</span>' : ''}
  </div>
`;
```

## Dos and Don'ts

### Dos ✅

1. **Use short and focused functions in a single responsibility**
2. **Prefer const over let, and avoid var completely**
3. **Use modern array methods (map, filter, reduce) instead of manual loops**
4. **Use async/await for asynchronous code instead of callbacks or .then()**
5. **Apply descriptive and meaningful names to variables and functions**
6. **Organize code into modules with clear responsibilities**
7. **Prefer immutability when manipulating data (create copies instead of modifying)**
8. **Use template literals for string concatenation**
9. **Apply destructuring to access object properties**
10. **Implement appropriate error handling (try/catch)**

### Don'ts ❌

1. **Do not use var (prefer const, and let when necessary)**
2. **Avoid long functions (more than 20-30 lines)**
3. **Avoid nested callbacks (callback hell)**
4. **Avoid direct object modifications (mutations) without necessity**
5. **Avoid ignoring error handling in asynchronous code**
6. **Avoid implicit type coercion (use === and !==)**
7. **Do not declare multiple variables in a single line**
8. **Avoid using eval() and with()**
9. **Avoid using for/while loops when array methods serve**
10. **Avoid global variables**

## JavaScript Performance Tips

1. **Minimize DOM operations**

```javascript
// ❌ RUIM: Many DOM operations in a loop
for (let i = 0; i < 1000; i++) {
  document.getElementById('container').innerHTML += `<div>${i}</div>`;
}

// ✅ BOM: Manipulate outside the DOM and insert once
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = i;
  fragment.appendChild(div);
}
document.getElementById('container').appendChild(fragment);
```

2. **Use memoization for computationally expensive functions**

```javascript
// Simple memoization for pure functions
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Usage
const expensiveOperation = memoize((n) => {
  console.log('Calculating...');
  return n * n;
});

expensiveOperation(4); // Calculates and stores in cache
expensiveOperation(4); // Returns from cache without recalculating
```

3. **Debounce and Throttle for frequent events**

```javascript
// Debounce: Executes only after a period of inactivity
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// Throttle: Limits execution to once every period
const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Usage
const handleSearch = debounce(() => {
  // Search for results
}, 300);

const handleScroll = throttle(() => {
  // Update UI during scroll
}, 100);
```

4. **Lazy loading of components or resources**

```javascript
// Lazy loading of images
const lazyLoadImages = () => {
  const images = document.querySelectorAll('[data-src]');
  
  const loadImage = (image) => {
    image.src = image.dataset.src;
    image.removeAttribute('data-src');
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });
  
  images.forEach(image => observer.observe(image));
};
```

5. **Use Web Workers for intensive tasks**

```javascript
// In main.js
if (window.Worker) {
  const worker = new Worker('worker.js');
  
  worker.postMessage({
    command: 'process',
    data: largeDataset
  });
  
  worker.onmessage = (e) => {
    const result = e.data;
    updateUI(result);
  };
}

// In worker.js
self.onmessage = (e) => {
  if (e.data.command === 'process') {
    const result = processData(e.data.data);
    self.postMessage(result);
  }
};

function processData(data) {
  // Heavy processing that wouldn't block the UI
  return transformedData;
}
``` 