# Commits

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](05-commits.md)
> - [Português](05-commits.pt.md)

## Mensagens de Commit

As mensagens de commit devem ser claras e informativas, facilitando o entendimento das mudanças realizadas. É obrigatório incluir o ID do ticket no início do resumo.

- **Formato**:
  ```
  [TICKET_ID]: Resumo breve (até 50 caracteres)

  Descrição bem detalhada (obrigatória, até 90 caracteres por linha) para cada funcionalidade, documentação, teste, etc. implementado
  ```

**Exemplo**:
```
DRPT-18: Adiciona funcionalidade de login com Google

Implementa autenticação OAuth2 usando a API do Google.
Adiciona testes unitários para a nova funcionalidade.
```

## Melhores Práticas

- **Use Tempo Imperativo**: Use o tempo imperativo para descrever a ação sendo realizada na mensagem do commit. (ex: "Adiciona", "Atualiza", "Corrige", "Remove", etc)
- **Commits Pequenos e Frequentes**: Faça commits pequenos e frequentes para facilitar o rastreamento de mudanças e identificação de problemas.
- **Atomização**: Cada commit deve representar uma única mudança lógica.
- **Evite Commits Grandes**: Divida mudanças grandes em commits menores.
- **Não Faça Commit de Arquivos Temporários**: Exclua arquivos temporários ou sensíveis usando `.gitignore`.
- **Revise Antes de Commitar**: Verifique as mudanças e mensagens antes de fazer o commit. 