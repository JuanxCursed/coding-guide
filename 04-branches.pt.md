# Branches

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](04-branches.md)
> - [Português](04-branches.pt.md)

## Estrutura de Branches

Adotamos uma estrutura de branches que facilita o desenvolvimento paralelo e a integração contínua. As branches principais são:

- **main**: A branch principal que reflete o estado estável do código em produção.
- **development**: A branch de desenvolvimento onde ocorrem as integrações antes de serem mescladas na `main`.
- **[ID do Ticket]**: Branches para desenvolvimento de funcionalidades ou correções específicas, nomeadas de acordo com o ID do ticket correspondente.

## Nomenclatura de Branches

Utilizamos uma convenção baseada em tickets para nomear branches, facilitando a rastreabilidade e identificando o propósito de cada branch.

- **Branches de Desenvolvimento**: `[ID_DO_TICKET]`
  
  **Exemplos:**
  - `DRPT-18`
  - `ABC-1`
  - `EDCBA-123`
  - `AIF-4`

## Fluxo de Trabalho

Adotamos um fluxo de trabalho simplificado focado no uso do sistema de tickets. O fluxo segue estas etapas:

1. **Criação da Branch**:
   - Crie uma branch a partir da `development` com o nome correspondente ao ID do ticket.
   - **Exemplo**:
     ```bash
     git checkout development
     git checkout -b DRPT-18
     ```

2. **Desenvolvimento**:
   - Realize o desenvolvimento na branch criada.
   - Faça commits seguindo a convenção de mensagem que inclui o ID do ticket.

3. **Pull Request**:
   - Ao concluir o desenvolvimento, crie um Pull Request (PR) apontando para a branch `development`.
   - Siga as diretrizes de revisão de código antes da mesclagem.

4. **Mesclagem**:
   - Após a aprovação do PR e verificação da integração contínua, faça a mesclagem na `development`. 