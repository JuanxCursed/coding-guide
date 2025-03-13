# Pull Requests

## Creating Pull Requests

Upon completing development on a branch, create a Pull Request (PR) to integrate the changes into the `development` branch.

**Steps**:
1. Access the repository on GitHub.
2. Click on "New Pull Request".
3. Select the source branch (e.g., `ABCD-18`) and the target branch (`development`).
4. Fill in the PR title and description, including:
   - **Title**: `[TICKET_ID]: Clear summary of the change.`
   - **Description**: Details about what was done, why it was done, and any relevant additional information.
   - **Tasks**: List the tasks completed in this PR.
   - **Screenshots**: Include screenshots of any relevant changes, mainly for visual confirmation and UI changes.
   - **References**: Links to related issues or tickets.
5. Go back to the Ticket/Issue, and fill out this information:
   - **(WWW)**: What was done, why was it done, and which problem was solved?
   - **Steps to test**: Basic steps description to execute a manual test
   - **Validation criteria**: List clearly what must be validated
6. Move to `Code review` stage, and send the Ticket/Issue link on the communication tool on the respective channel of the project

**Example Description**:
```
// On the pull request:

### Description
Adds Google authentication functionality, allowing users to log in using their Google accounts.

### Screenshots

![Screenshot 1](https://example.com/screenshot1.png)
![Screenshot 2](https://example.com/screenshot2.png)

### Resolves/Closes Task/Issue
Closes [ABCD-18](task_link)
```


```
// On the ticket:

### What was done, why was it done, and which problem was solved?
- Fixed red error when trying to access Transfer Points bottom sheet;
- Fixed api comunication error while trying to transfer points.

### Steps to test
- Access [link] and make login
- click on topbar menu item: a > b > c
- fill out the form with minimum information required
- try to submit

### Validation criteria
- It must validate the form fields properly by required or data format
- Must not enable the button if the required fields are not filled
- Must submits if filled
- If submitted, must redirect to the list and the record must be present
```

## Reviewing Pull Requests

All PRs must be reviewed by at least two team member before testing and merging. The review should focus on:

- **Code Quality**: Ensuring adherence to coding standards.
- **Functionality**: Ensuring the functionality meets the requirements.
- **Tests**: Confirming the existence and coverage of tests.
- **Documentation**: Ensuring documentation is up to date.

**Review Checklist**:
- [ ] Code follows project conventions.
- [ ] No obvious bugs.
- [ ] Tests have been added or updated.
- [ ] Documentation has been updated as necessary.
- [ ] The PR resolves the referenced issue/ticket.

## Merging

After PR approval, merging should follow these guidelines:

- **Squash and Merge**: Use "Squash and Merge" to consolidate all PR commits into a single commit on the `development` branch. This commit must follow the message convention with the ticket ID.
- **Rebase**: Alternatively, use rebase to maintain a linear history, ensuring the main commit message includes the ticket ID.
- **Branch Protection**: Configure protections on the `development` branch to require reviews before merging and ensure the test suite passes.
