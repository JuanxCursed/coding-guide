# Code Review

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](07-code-review.md)
> - [Português](07-code-review.pt.md)

## Diretrizes para Todos

- **Respeito e Colaboração**:
  - Aceite que muitas decisões de programação são opiniões. Discuta trade-offs, prefira o que é melhor e chegue a uma resolução rapidamente.
  - Faça boas perguntas; não faça exigências. ("O que você acha de nomear isso como `:user_id`?")
  - Evite termos que possam ser vistos como referência a traços pessoais. ("burro", "estúpido"). Assuma que todos são inteligentes e bem-intencionados.
  - Seja explícito. Lembre-se que nem sempre as pessoas entendem suas intenções online.
  - Seja humilde. ("Não tenho certeza - vamos pesquisar.")
  - Não use hipérboles. ("sempre", "nunca", "eternamente", "nada")
  - Não use sarcasmo.
  - Mantenha a comunicação real. Se emojis, gifs animados ou humor não são seu estilo, não os force. Se são, use-os com moderação.
  - Comunique-se de forma síncrona (ex: chat, compartilhamento de tela, pessoalmente) se houver muitos comentários do tipo "Não entendi" ou "Solução alternativa:". Poste um comentário de acompanhamento resumindo a discussão.

## Tendo Seu Código Revisado

- **Seja Grato pelas Sugestões do Revisor**: ("Boa observação. Vou fazer essa mudança.")
- **Esteja Ciente que pode ser [desafiador transmitir emoção e intenção online].**
- **Explique Por Que o Código Existe**: ("É assim por causa dessas razões. Ficaria mais claro se eu renomeasse esta classe/arquivo/método/variável?")
- **Extraia Algumas Mudanças e Refatorações para Tickets/Stories Futuros.**
- **Vincule o Code Review ao Ticket/Story**: ("Pronto para revisão: https://github.com/organization/project/pull/1")
- **Vincule a Tarefa/Issue aos PRs**: ("### Fecha Tarefa/Issue: https://link_para_tarefa_ou_issue")
- **Faça Push de Commits Baseados em Rodadas Anteriores de Feedback como Commits Isolados na Branch**: Não faça squash até que a branch esteja pronta para merge. Revisores devem poder ler atualizações individuais baseadas em seu feedback anterior.
- **Procure Entender a Perspectiva do Revisor.**
- **Tente Responder a Cada Comentário.**
- **Aguarde para Fazer o Merge da Branch até que a Integração Contínua (TDDium, Travis CI, CircleCI, etc.) Indique que a Suíte de Testes está Verde na Branch.**
- **Faça o Merge Quando Você Se Sentir Confiante no Código e Seu Impacto no Projeto.**
- **O Controle Editorial Final Reside com o Autor do Pull Request.**

[desafiador transmitir emoção e intenção online]: https://thoughtbot.com/blog/empathy-online

## Revisando Código

Entenda por que a mudança é necessária (corrige um bug, melhora a experiência do usuário, refatora código existente). Então:

- **Comunique Quais Ideias Você Considera Importantes e Quais Não.**
- **Identifique Maneiras de Simplificar o Código Enquanto Ainda Resolve o Problema.**
- **Se as Discussões Se Tornarem Muito Filosóficas ou Acadêmicas, Mova a Discussão para Offline** (ex: discussões técnicas regulares). Enquanto isso, permita que o autor tome a decisão final sobre implementações alternativas.
- **Ofereça Implementações Alternativas**, mas assuma que o autor já as considerou. ("O que você acha de usar um validador personalizado aqui?")
- **Procure Entender a Perspectiva do Autor.**
- **Aprove o Pull Request com um 👍 ou Comentário "Pronto para Merge".**
- **Lembre-se Que Você Está Aqui para Fornecer Feedback, Não para Ser um Gatekeeper.**

## Comentários de Estilo

Revisores devem comentar sobre diretrizes de estilo não seguidas. Exemplo de comentário:

    > Ordene rotas resourceful alfabeticamente por nome.

Um exemplo de resposta a comentários de estilo:

    Ops. Boa captura, obrigado. Corrigido em a4994ec. 