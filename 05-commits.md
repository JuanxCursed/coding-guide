# Commits

## Commit Messages

Commit messages should be clear and informative, facilitating the understanding of the changes made. Including the ticket ID at the beginning of the summary is mandatory.

- **Format**:
  ```
  [TICKET_ID]: Brief summary (up to 50 characters)

  Well Detailed description (required, up to 90 characters per line) for each implemented feature, doc, test, etc
  ```


**Example**:
```
DRPT-18: Add Google login functionality

Implement OAuth2 authentication using Google's API.
Add unit tests for the new functionality.
```

## Best Practices
- **Use Imperative Tense**: Use the imperative tense to describe the action being performed in the commit message. (eg: "Add", "Update", "Fix", "Remove", etc)
- **Small and Frequent Commits**: Make small and frequent commits to facilitate tracking changes and identifying issues.
- **Atomization**: Each commit should represent a single logical change.
- **Avoid Large Commits**: Split large changes into smaller commits.
- **Do Not Commit Temporary Files**: Exclude temporary or sensitive files using `.gitignore`.
- **Review Before Committing**: Check changes and messages before making the commit.
