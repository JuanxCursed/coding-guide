# Configuração de ESLint e Prettier para Nuxt com TypeScript, Supabase e TailwindCSS

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](15-eslint-prettier.md)
> - [Português](15-eslint-prettier.pt.md)

Este guia cobre as melhores práticas para configurar ESLint e Prettier em projetos Nuxt que utilizam TypeScript, Supabase e TailwindCSS, garantindo consistência de código e prevenindo erros comuns.

## Instalação das Dependências

```bash
# Usando Yarn (recomendado)
yarn add -D eslint prettier @nuxtjs/eslint-config-typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue eslint-config-prettier eslint-plugin-prettier eslint-plugin-tailwindcss eslint-plugin-nuxt

# Ou usando npm
npm install --save-dev eslint prettier @nuxtjs/eslint-config-typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue eslint-config-prettier eslint-plugin-prettier eslint-plugin-tailwindcss eslint-plugin-nuxt
```

## Configuração do ESLint

Crie um arquivo `.eslintrc.js` na raiz do seu projeto:

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'plugin:nuxt/recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'tailwindcss'],
  rules: {
    // Regras de sintaxe e estilo
    'vue/multi-word-component-names': 'off', // Permite nomes de componentes de uma palavra (comum em Nuxt)
    'vue/no-multiple-template-root': 'off', // Necessário para Vue 3
    'vue/no-v-html': 'warn', // Alertar sobre uso potencialmente inseguro de v-html
    'vue/component-tags-order': ['error', { order: ['script', 'template', 'style'] }],
    'vue/block-lang': [
      'error',
      {
        script: { lang: 'ts' }, // Força uso de TypeScript em <script>
        style: { lang: 'postcss' }, // Recomendado para TailwindCSS
      },
    ],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineProps', 'defineEmits', 'defineExpose', 'withDefaults'],
      },
    ],
    'vue/component-api-style': ['error', ['script-setup']], // Preferir script setup
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off', // Auto-inferência de tipos
    '@typescript-eslint/no-explicit-any': 'warn', // Desencorajar uso de 'any'
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
    
    // TailwindCSS
    'tailwindcss/no-custom-classname': 'warn', // Alerta para classes não reconhecidas pelo Tailwind
    'tailwindcss/classnames-order': 'error', // Ordena classes do Tailwind
    
    // Nuxt
    'nuxt/no-cjs-in-config': 'error',
    
    // Prettier
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
    
    // Regras gerais
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-var': 'error',
    'prefer-const': 'error',
  },
  settings: {
    'tailwindcss': {
      // Caminho para sua configuração do Tailwind
      config: 'tailwind.config.ts',
      // Habilitar sugestões de classe
      classRegex: '(class(Name)?|tw)\\s*[=:]\\s*["\']([^"\']*)["\']',
    },
  },
}
```

## Configuração do Prettier

Crie um arquivo `.prettierrc` na raiz do seu projeto:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": false,
  "htmlWhitespaceSensitivity": "css",
  "overrides": [
    {
      "files": "*.vue",
      "options": {
        "parser": "vue"
      }
    }
  ]
}
```

## Ignorando Arquivos

Crie um arquivo `.eslintignore` na raiz do seu projeto:

```
.nuxt
.output
dist
node_modules
*.log
.DS_Store
.env
.env.*
!.env.example
```

E um arquivo `.prettierignore`:

```
.nuxt
.output
dist
node_modules
*.log
.DS_Store
public
```

## Scripts NPM/Yarn

Adicione estes scripts no seu `package.json`:

```json
{
  "scripts": {
    "lint": "eslint --ext .ts,.js,.vue --ignore-path .eslintignore .",
    "lint:fix": "eslint --ext .ts,.js,.vue --ignore-path .eslintignore . --fix",
    "format": "prettier --write .",
    "typecheck": "nuxi typecheck"
  }
}
```

## Integração com VS Code

### Extensões Recomendadas

Crie um arquivo `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Configurações do VS Code

Crie um arquivo `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "volar.autoCompleteRefs": true,
  "volar.codeLens.scriptSetupTools": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.documentSelectors": ["**/*.{ts,js,vue}"],
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "css.validate": false,
  "tailwindCSS.includeLanguages": {
    "vue": "html",
    "vue-html": "html"
  },
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.validate": true
}
```

## Regras Específicas para Supabase

Adicione estas regras adicionais para projetos que usam Supabase:

```javascript
// Adicione estas regras ao seu .eslintrc.js
{
  rules: {
    // ... outras regras
    
    // Supabase - Boas Práticas
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@supabase/supabase-js',
            message: 'Importe do wrapper do cliente em ~/utils/supabase.ts',
          },
        ],
        patterns: [
          {
            group: ['**/server/**'],
            importNames: ['useSupabaseClient'],
            message: 'Use serverSupabaseClient no servidor',
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="useSupabaseClient"] > !TSTypeParameterInstantiation',
        message: 'useSupabaseClient deve especificar o tipo de banco de dados',
      },
    ],
  }
}
```

## Lint-staged com Husky

Instale as dependências:

```bash
yarn add -D lint-staged husky
```

Configure o lint-staged no `package.json`:

```json
{
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix"
    ],
    "*.vue": [
      "eslint --fix"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "prepare": "husky install"
  }
}
```

Configure o Husky:

```bash
yarn prepare
npx husky add .husky/pre-commit "yarn lint-staged"
```

## Regras Personalizadas para Nuxt/Supabase/Tailwind

Adicione estas regras personalizadas para garantir boa integração entre as tecnologias:

```javascript
// Em .eslintrc.js, na seção rules
{
  rules: {
    // ... outras regras
    
    // Nuxt com TypeScript
    'vue/define-props-declaration': ['error', 'type-based'], // Forçar defineProps<Interface>()
    'vue/define-emits-declaration': ['error', 'type-based'], // Forçar defineEmits<Interface>()
    
    // Supabase + Nuxt
    'nuxt/no-env-in-hooks': 'error', // Evitar process.env em hooks (use runtimeConfig)
    
    // Tailwind + Vue
    'vue/no-static-inline-styles': 'error', // Preferir TailwindCSS ao invés de estilos inline
    
    // Segurança com Supabase
    'no-restricted-properties': [
      'error',
      {
        object: 'supabase',
        property: 'auth',
        message: 'Use os composables do Nuxt (useSupabaseUser, useSupabaseClient) para autenticação',
      },
    ],
  }
}
```

## Melhores Práticas para ESLint com este Ecossistema

1. **Prefira TypeScript Explícito:**
   - Use tipos explícitos para props, emits e retornos de funções complexas
   - Evite `any` e prefira `unknown` quando necessário

2. **Consistência em Componentes Vue:**
   - Use sempre `<script setup lang="ts">` 
   - Mantenha ordem consistente: script → template → style
   - Use convenção PascalCase para nomes de componentes

3. **TailwindCSS:**
   - Mantenha classes Tailwind ordenadas semanticamente
   - Evite misturar classes personalizadas com Tailwind
   - Prefira extrair componentes a repetir classes longas

4. **Supabase:**
   - No lado do cliente, sempre use composables Nuxt para Supabase
   - No servidor, use sempre os services como abstração

5. **Segurança:**
   - Evite `v-html` a menos que absolutamente necessário
   - Valide todos os dados vindos do Supabase antes de usá-los
   - Não exponha variáveis de ambiente sensíveis no frontend

## Exemplo Completo de Componente com Todas as Regras Aplicadas

```vue
<script setup lang="ts">
import type { Post } from '~/shared/types/models'

// Props fortemente tipadas
interface Props {
  posts: Post[]
  isLoading?: boolean
}

// Eventos fortemente tipados
interface Emits {
  (e: 'refresh'): void
  (e: 'select', post: Post): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Estado reativo tipado
const selectedPostId = ref<string | null>(null)

// Computed tipado
const sortedPosts = computed<Post[]>(() => {
  return [...props.posts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
})

// Método tipado
function selectPost(post: Post): void {
  selectedPostId.value = post.id
  emit('select', post)
}

// Lifecycle hooks
onMounted(() => {
  console.log('Posts carregados:', props.posts.length)
})
</script>

<template>
  <div class="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
    <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">
      Posts Recentes
    </h2>
    
    <div v-if="isLoading" class="flex justify-center py-4">
      <span class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
    </div>
    
    <div v-else-if="sortedPosts.length === 0" class="py-4 text-center text-gray-500">
      Nenhum post encontrado
    </div>
    
    <ul v-else class="space-y-3">
      <li 
        v-for="post in sortedPosts" 
        :key="post.id"
        :class="[
          'p-3 border rounded transition',
          selectedPostId === post.id 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50'
        ]"
        @click="selectPost(post)"
      >
        <h3 class="font-medium text-gray-900 dark:text-white">
          {{ post.title }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ new Date(post.created_at).toLocaleDateString() }}
        </p>
      </li>
    </ul>
    
    <button
      type="button"
      class="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      @click="emit('refresh')"
    >
      Atualizar
    </button>
  </div>
</template> 