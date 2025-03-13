# Code Review

## Guidelines for Everyone

- **Respect and Collaboration**:
  - Accept that many programming decisions are opinions. Discuss trade-offs, prefer what is best, and reach a resolution quickly.
  - Ask good questions; do not make demands. ("What do you think about naming this `:user_id`?")
  - Avoid terms that could be seen as referring to personal traits. ("dumb", "stupid"). Assume everyone is intelligent and well-meaning.
  - Be explicit. Remember that people do not always understand your intentions online.
  - Be humble. ("I'm not sure - let's look it up.")
  - Do not use hyperbole. ("always", "never", "endlessly", "nothing")
  - Do not use sarcasm.
  - Keep communication real. If emojis, animated gifs, or humor are not your style, do not force them. If they are, use them sparingly.
  - Communicate synchronously (e.g., chat, screen-sharing, in person) if there are too many "I didn't understand" or "Alternative solution:" comments. Post a follow-up comment summarizing the discussion.

## Having Your Code Reviewed

- **Be Grateful for the Reviewer's Suggestions**: ("Good call. I'll make that change.")
- **Be Aware that it can be [challenging to convey emotion and intention online].**
- **Explain Why the Code Exists**: ("It's like that because of these reasons. Would it be clearer if I rename this class/file/method/variable?")
- **Extract Some Changes and Refactoring into Future Tickets/Stories.**
- **Link to the Code Review from the Ticket/Story**: ("Ready for review: https://github.com/organization/project/pull/1")
- **Link to the Task/Issue from the PRs**: ("### Closes Task/Issue: https://link_to_task_or_issue")
- **Push Commits Based on Earlier Rounds of Feedback as Isolated Commits to the Branch**: Do not squash until the branch is ready to merge. Reviewers should be able to read individual updates based on their earlier feedback.
- **Seek to Understand the Reviewer's Perspective.**
- **Try to Respond to Every Comment.**
- **Wait to Merge the Branch until Continuous Integration (TDDium, Travis CI, CircleCI, etc.) Indicates the Test Suite is Green in the Branch.**
- **Merge Once You Feel Confident in the Code and Its Impact on the Project.**
- **Final Editorial Control Resides with the Pull Request Author.**

[challenging to convey emotion and intention online]: https://thoughtbot.com/blog/empathy-online

## Reviewing Code

Understand why the change is necessary (fixes a bug, improves the user experience, refactors existing code). Then:

- **Communicate Which Ideas You Feel Strongly About and Which You Don't.**
- **Identify Ways to Simplify the Code While Still Solving the Problem.**
- **If Discussions Become Too Philosophical or Academic, Move the Discussion Offline** (e.g., regular technical discussions). Meanwhile, allow the author to make the final decision on alternative implementations.
- **Offer Alternative Implementations**, but assume the author has already considered them. ("What do you think about using a custom validator here?")
- **Seek to Understand the Author's Perspective.**
- **Sign Off on the Pull Request with a 👍 or "Ready to Merge" Comment.**
- **Remember That You Are Here to Provide Feedback, Not to Be a Gatekeeper.**

## Style Comments

Reviewers should comment on missed style guidelines. Example comment:

    > Order resourceful routes alphabetically by name.

An example response to style comments:

    Whoops. Good catch, thanks. Fixed in a4994ec.
