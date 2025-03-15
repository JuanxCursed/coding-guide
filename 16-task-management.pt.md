# POP - Procedimento Operacional Padrão: Gerenciamento de Tarefas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](16-task-management.md)
> - [Português](16-task-management.pt.md)

## Guia de Estimativa de Story Points (Escala Fibonacci)

| Story Points | Estimativa de Tempo | Complexidade | Incerteza |
|--------------|--------------|------------|-------------|
| 1 | Alguns minutos | Muito simples, bem compreendida | Quase nenhum risco |
| 2 | Até uma hora | Simples, claramente definida | Risco mínimo |
| 3 | Algumas horas | Moderadamente complexa | Algumas incógnitas |
| 5 | Um dia | Complexa com múltiplas partes | Incógnitas significativas |
| 8 | Vários dias | Muito complexa, múltiplos sistemas | Alto nível de incerteza |
| 13 | Uma semana | Extremamente complexa, múltiplas integrações | Altíssima incerteza ou dependências |

*Nota: Tarefas com 8 ou 13 pontos devem ser divididas em tarefas menores.*

## 1. Objetivo

Estabelecer diretrizes e padronizar o fluxo de tarefas em qualquer projeto, garantindo clareza nas responsabilidades, eficiência na entrega e qualidade do código.

## 2. Aplicação

Este procedimento se aplica a todos os envolvidos no desenvolvimento de software, incluindo:
- Desenvolvedores Frontend e Backend
- QA (Garantia de Qualidade)
- Tech Leads
- Product Owners
- Gerentes de Projeto

## 3. Definições

| Termo | Definição |
|------|-----------|
| Tarefa | Unidade de trabalho representando uma funcionalidade, correção ou melhoria |
| PR (Pull Request) | Solicitação para integrar código de uma branch para outra |
| Code Review | Processo de revisão de código por outros desenvolvedores |
| QA | Quality Assurance - Profissional responsável por testes e garantia de qualidade |
| Branch | Ramificação de código para desenvolvimento isolado de funcionalidade |
| Merge | Processo de integração de código de uma branch para outra |

## 4. Responsabilidades

| Função | Responsabilidades |
|-------|------------------|
| Desenvolvedor | Implementar tarefas conforme especificações, revisar código de outros desenvolvedores, corrigir problemas identificados |
| Tech Lead | Revisar código, garantir que padrões técnicos sejam seguidos, apoiar desenvolvedores na resolução de problemas |
| QA | Testar funcionalidades implementadas, identificar problemas e reportar inconsistências |
| Product Owner | Priorizar tarefas, esclarecer requisitos e validar entregas do ponto de vista de negócio |
| Gerente de Projeto | Coordenar fluxo de trabalho, garantir cumprimento de prazos, facilitar comunicação entre stakeholders |

## 5. Fluxo de Tarefas

### 5.1 Estágios da Tarefa

#### 5.1.1 Backlog

**Descrição:** Tarefas que estão sendo preparadas e ainda não estão prontas para serem trabalhadas.

**Regras:**
- **ATENÇÃO:** Não iniciar trabalho em tarefas neste estágio sem autorização prévia
- Sempre pergunte antes de pegar uma tarefa deste estágio
- Solicite definições claras se a tarefa não estiver bem especificada
- Antes de mover para To Do, a tarefa deve ter:
  - Alinhamento entre gerente de projeto, cliente e desenvolvedores sobre escopo e expectativas
  - Módulo ou milestone atribuído
  - Tags apropriadas para categorização
  - Estimativa de story points (usando a escala Fibonacci fornecida acima)
  - Descrição detalhada incluindo:
    - Objetivo claro da tarefa
    - Critérios de aceitação
    - Considerações ou restrições técnicas
    - Dependências de outras tarefas ou sistemas
    - Especificações ou mockups de UI/UX (se aplicável)

**Responsável:** Product Owner, Tech Lead, Desenvolvedor Designado

**Critérios para Mover:** A tarefa deve ter requisitos claros, estar estimada, com tags, associada a um milestone e priorizada

#### 5.1.2 To Do

**Descrição:** Tarefas prontas para serem trabalhadas.

**Regras:**
- Pode ser iniciada pelo desenvolvedor designado para a tarefa
- Sempre observar prioridades
- Se não houver marcação de prioridade, considerar como prioridade média
- Ao pegar uma tarefa, movê-la para "Em Andamento"

**Responsável:** Desenvolvedores

**Critérios para Mover:** Desenvolvedor designado está disponível para executar a tarefa

#### 5.1.3 Em Andamento

**Descrição:** Tarefas que estão sendo ativamente desenvolvidas. (O desenvolvedor está ativamente trabalhando na tarefa, limitado a 1 tarefa por desenvolvedor por vez)

**Regras:**
- Manter o status da tarefa atualizado
- Comunicar impedimentos o mais rápido possível
- Criar branches seguindo o padrão: `[TASK-ID]` (originando da branch de desenvolvimento)
- Para tarefas com subtarefas:
  - A tarefa pai terá sua própria branch
  - Branches de tarefas filhas serão ramificadas da branch pai
  - Cada tarefa filha deve completar seu próprio ciclo de code review e testes individualmente
  - Tarefas filhas devem ser mergeadas de volta para a branch pai quando completadas
  - Somente após todas as subtarefas estarem completadas a branch pai deve ser submetida para PR para desenvolvimento
  - A tarefa pai requer uma revisão final abrangente de código e testes mais extensivos antes do merge
  - O PR da tarefa pai deve incluir um resumo de todas as subtarefas completadas e seus respectivos resultados de testes
- Fazer commits frequentes com mensagens claras
- Quando pronto para revisão, seguir as diretrizes na [documentação de Pull Requests](06-pull-requests.pt.md) para:
  - Criar uma descrição detalhada do PR
  - Adicionar screenshots das mudanças
  - Preencher o WWW (O que, Por que, Qual problema resolvido)
  - Documentar passos para testar
  - Definir critérios de validação

**Responsável:** Desenvolvedores

**Critérios para Mover:** Desenvolvimento concluído, testes unitários passando e PR criado de acordo com as diretrizes estabelecidas

#### 5.1.4 Code Review

**Descrição:** Tarefas com código implementado aguardando revisão.

**Regras:**
- **ATENÇÃO:** Code reviews são PRIORIDADE
- Não é necessário esperar pelo Tech Lead para mover para Testes
- **Requisito:** 2 aprovações são suficientes para mover para Testes
- **IMPORTANTE:** A tarefa deve ir para Testes NO MESMO DIA
- **Ação Necessária:** Pressionar outros devs para fazer a revisão o mais rápido possível

**Responsável:** Desenvolvedores, Tech Lead

**Critérios para Mover:** 2 aprovações no PR

#### 5.1.5 Mudanças Solicitadas

**Descrição:** Tarefas que precisam de ajustes após code review.

**Regras:**
- **PRIORIDADE MÁXIMA** - Pare qualquer coisa que estiver fazendo para resolver
- Tipicamente requer minutos ou no máximo uma hora de esforço
- NUNCA deixar tarefas paradas neste estágio
- Após resolver, notificar quem solicitou as mudanças e mover de volta para o estágio de Code Review

**Responsável:** Desenvolvedores

**Critérios para Mover:** Todas as mudanças solicitadas foram implementadas

#### 5.1.6 Testes

**Descrição:** Tarefas prontas para serem validadas pelo QA.

**Regras:**
- Prioridade máxima para QA
- Deve ser testada e movida rapidamente
- **Ação Necessária:** Se sua tarefa está aqui, acompanhar com QA pelo menos 4x por dia até a tarefa ser aprovada ou rejeitada
- Fornecer ambientes de teste ou instruções claras para reprodução

**Responsável:** QA, Desenvolvedores

**Critérios para Mover:** Todos os testes passaram sem problemas

#### 5.1.7 Aprovado

**Descrição:** Tarefas validadas pelo QA e prontas para serem integradas.

**Regras:**
- Pode ser mergeada para a branch principal (ou branch de feature)
- Após o merge, mover para "Pronto para Deploy"
- Manter a branch atualizada com a principal para evitar conflitos

**Responsável:** Desenvolvedores

**Critérios para Mover:** PR mergeado com sucesso

#### 5.1.8 Pronto para Deploy

**Descrição:** Tarefas integradas prontas para serem implantadas em produção.

**Regras:**
- **ATENÇÃO:** Apenas o Tech Lead ou pessoa responsável pelo projeto assume daqui
- Alinhamento com o cliente pode ser necessário
- Tarefas neste estágio são agrupadas para releases

**Responsável:** Tech Lead, Gerente de Projeto

**Critérios para Mover:** Deploy em produção bem-sucedido

#### 5.1.9 Concluído

**Descrição:** Tarefas completamente finalizadas e disponíveis em produção.

**Regras:**
- Verificar se a funcionalidade está operando corretamente em produção
- Documentar lições aprendidas, se aplicável
- Celebrar conquistas! 🎉 Hora da pizza!

**Responsável:** Todos