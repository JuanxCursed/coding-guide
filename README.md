# 💻 Code Standards and Guidelines (includes Git)

This document outlines the processes and rules that the team must follow when using Coding/Git, covering **branches**, **pull requests**, **commits**, and **code review**. The goal is to ensure consistency, quality, and efficiency in software development.

## Table of Contents

1. [Branches](#branches)
   - [Branch Structure](#branch-structure)
   - [Branch Naming](#branch-naming)
   - [Workflow](#workflow)
2. [Commits](#commits)
   - [Commit Messages](#commit-messages)
   - [Best Practices](#best-practices)
3. [Pull Requests](#pull-requests)
   - [Creating Pull Requests](#creating-pull-requests)
   - [Reviewing Pull Requests](#reviewing-pull-requests)
   - [Merging](#merging)
4. [Code Review](#code-review)
   - [Guidelines for Everyone](#guidelines-for-everyone)
   - [Having Your Code Reviewed](#having-your-code-reviewed)
   - [Reviewing Code](#reviewing-code)
   - [Style Comments](#style-comments)
5. [Tools and Integrations](#tools-and-integrations)

---

## Branches

### Branch Structure

We adopt a branch structure that facilitates parallel development and continuous integration. The main branches are:

- **main**: The primary branch that reflects the stable state of the code in production.
- **development**: The development branch where integrations occur before being merged into `main`.
- **[Ticket ID]**: Branches for developing specific features or fixes, named after the corresponding ticket ID.

### Branch Naming

We use a ticket-based convention to name branches, facilitating traceability and identifying the purpose of each branch.

- **Development Branches**: `[TICKET_ID]`
  
  **Examples:**
  - `DRPT-18`
  - `ABC-1`
  - `EDCBA-123`
  - `AIF-4`

### Workflow

We adopt a simplified workflow focused on using the ticket system. The workflow follows these steps:

1. **Branch Creation**:
   - Create a branch from `development` with the name corresponding to the ticket ID.
   - **Example**:
     ```bash
     git checkout development
     git checkout -b DRPT-18
     ```

2. **Development**:
   - Perform development on the created branch.
   - Make commits following the message convention that includes the ticket ID.

3. **Pull Request**:
   - Upon completing development, create a Pull Request (PR) pointing to the `development` branch.
   - Follow the code review guidelines before merging.

4. **Merging**:
   - After PR approval and continuous integration verification, merge into `development`.

---

## Commits

### Commit Messages

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

### Best Practices
- **Use Imperative Tense**: Use the imperative tense to describe the action being performed in the commit message. (eg: "Add", "Update", "Fix", "Remove", etc)
- **Small and Frequent Commits**: Make small and frequent commits to facilitate tracking changes and identifying issues.
- **Atomization**: Each commit should represent a single logical change.
- **Avoid Large Commits**: Split large changes into smaller commits.
- **Do Not Commit Temporary Files**: Exclude temporary or sensitive files using `.gitignore`.
- **Review Before Committing**: Check changes and messages before making the commit.

---

## Pull Requests

### Creating Pull Requests

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
   - **(WWW)**: What was done, why was it done, and which problem was solved?
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

### WWW: What was done, why was it done, and which problem was solved?

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



### Reviewing Pull Requests

All PRs must be reviewed by at least two team member before merging. The review should focus on:

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

### Merging

After PR approval, merging should follow these guidelines:

- **Squash and Merge**: Use "Squash and Merge" to consolidate all PR commits into a single commit on the `development` branch. This commit must follow the message convention with the ticket ID.
- **Rebase**: Alternatively, use rebase to maintain a linear history, ensuring the main commit message includes the ticket ID.
- **Branch Protection**: Configure protections on the `development` branch to require reviews before merging and ensure the test suite passes.

---

## Code Review

### Guidelines for Everyone

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

### Having Your Code Reviewed

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

### Reviewing Code

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



## Code Quality

### 1. Function Design
- Functions should do one thing only and do it well
- Keep functions small (ideally under 20 lines)
- Functions should have a single level of abstraction

✅ DO:
```python
def save_user(user: User) -> None:
    validate_user(user)
    persist_to_database(user)
    notify_user_creation(user)

def validate_user(user: User) -> None:
    if not user.email:
        raise ValidationError("Email is required")
    if not user.name:
        raise ValidationError("Name is required")
```

❌ DON'T:
```python
def save_user(user: User) -> None:
    # Don't mix validation, business logic, and side effects in one function
    if not user.email:
        raise ValidationError("Email is required")
    if not user.name:
        raise ValidationError("Name is required")
    db.session.add(user)
    db.session.commit()
    send_email(user.email, "Welcome!", "Welcome to our platform!")
```

### 2. Variable Naming
- Use intention-revealing names
- Use pronounceable names
- Use searchable names
- Avoid encodings

✅ DO:
```typescript
const activeUsers = users.filter(user => user.isActive);
const daysUntilExpiration = 30;
const isUserEligible = user.age >= minimumAge;
```

❌ DON'T:
```typescript
const u = users.filter(x => x.a);  // Avoid single-letter variables
const d = 30;  // What does 'd' mean?
const flag = user.age >= 18;  // 'flag' is not descriptive
```

### 3. Class Design
- Follow Single Responsibility Principle
- Encapsulate related data and behavior
- Keep class cohesion high

✅ DO:
```python
class OrderProcessor:
    def __init__(self, payment_gateway: PaymentGateway):
        self._payment_gateway = payment_gateway
        
    def process_order(self, order: Order) -> None:
        self._validate_order(order)
        self._process_payment(order)
        self._update_inventory(order)
        
    def _validate_order(self, order: Order) -> None:
        # Validation logic
        pass
```

❌ DON'T:
```python
class OrderManager:  # Too many responsibilities
    def process_order(self, order):
        # Validation mixed with business logic
        if not order.items:
            raise ValueError("Order must have items")
        
        # Payment processing mixed in
        payment_result = self.payment_gateway.charge(order.total)
        
        # Database operations mixed in
        self.db.save(order)
        
        # Email sending mixed in
        self.mailer.send_confirmation(order.email)
```

## Code Conventions

### Python

#### 1. Naming Conventions

✅ DO:
```python
# Variables and Functions (snake_case)
user_count = 0
def calculate_total_price(items: List[Item]) -> float:
    pass

# Classes (PascalCase)
class UserAccount:
    pass

# Constants (SCREAMING_SNAKE_CASE)
MAX_CONNECTIONS = 100
DEFAULT_TIMEOUT = 30

# Private attributes (single leading underscore)
class User:
    def __init__(self):
        self._internal_id = generate_id()
```

❌ DON'T:
```python
# Avoid these naming patterns
UserCount = 0  # Variables shouldn't use PascalCase
class user_account:  # Classes shouldn't use snake_case
MAX_CONNECTIONS = get_dynamic_value()  # Constants shouldn't be dynamic
class User:
    def __init__(self):
        self.__id = generate_id()  # Avoid double underscores unless necessary
```

#### 2. Imports Organization

✅ DO:
```python
# Standard library imports
from datetime import datetime
from typing import List, Optional

# Third-party imports
import pandas as pd
from fastapi import FastAPI

# Local application imports
from .models import User
from .utils.date import format_timestamp

# Constants after imports
DEFAULT_TIMEOUT = 30
```

❌ DON'T:
```python
# Don't mix import styles
from datetime import *  # Avoid wildcard imports
import pandas as pd
from .models import User
from fastapi import FastAPI
from typing import List, Optional  # Keep typing imports together
from .utils.date import format_timestamp
```

#### 3. Type Hints and Documentation

✅ DO:
```python
from typing import List, Optional

def get_active_users(
    min_age: int,
    status: Optional[str] = None
) -> List[User]:
    """
    Retrieve active users filtered by minimum age and optional status.
    
    Args:
        min_age: Minimum age of users to include
        status: Optional status filter
        
    Returns:
        List of User objects matching the criteria
        
    Raises:
        ValueError: If min_age is negative
    """
    if min_age < 0:
        raise ValueError("min_age must be positive")
    
    query = User.objects.filter(age >= min_age)
    if status:
        query = query.filter(status=status)
    return list(query)
```

❌ DON'T:
```python
def get_active_users(min_age, status=None):  # Missing type hints
    """Gets users"""  # Insufficient documentation
    if min_age < 0:
        raise ValueError()  # Unclear error message
    query = User.objects.filter(age >= min_age)
    if status:
        query = query.filter(status=status)
    return list(query)
```

### TypeScript

#### 1. Naming and Types

✅ DO:
```typescript
// Interfaces (PascalCase without I prefix)
interface UserProfile {
    readonly id: string;
    firstName: string;
    lastName: string;
    email: string;
}

// Types (PascalCase)
type ValidationResult = {
    isValid: boolean;
    errors: string[];
};

// Enums (PascalCase)
enum UserRole {
    Admin = 'ADMIN',
    Editor = 'EDITOR',
    Viewer = 'VIEWER',
}

// Functions (camelCase)
const calculateTotalPrice = (items: Item[]): number => {
    return items.reduce((total, item) => total + item.price, 0);
};
```

❌ DON'T:
```typescript
// Avoid these patterns
interface userProfile {}  // Interfaces should use PascalCase
type validation_result = {}  // Types should use PascalCase
enum user_role {}  // Enums should use PascalCase
const CalculateTotalPrice = () => {}  // Functions should use camelCase
```

#### 2. Dependency Injection and Abstractions

✅ DO:
```typescript
// Define interfaces for dependencies
interface UserRepository {
    findById(id: string): Promise<User>;
    save(user: User): Promise<void>;
}

// Use dependency injection
class UserService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly logger: ILogger
    ) {}

    async updateUser(userId: string, data: UserUpdateDto): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            this.logger.error(`User not found: ${userId}`);
            throw new NotFoundException('User not found');
        }
        
        Object.assign(user, data);
        await this.userRepository.save(user);
        return user;
    }
}
```

❌ DON'T:
```typescript
// Avoid tight coupling
class UserService {
    private repository = new UserRepository();  // Direct instantiation
    
    async updateUser(userId: string, data: any): Promise<any> {  // Avoid 'any'
        const user = await this.repository.findById(userId);
        if (!user) {
            console.log('User not found');  // Direct console usage
            throw new Error('Not found');  // Generic error
        }
        return await this.repository.save({ ...user, ...data });
    }
}
```

#### 3. Async/Await and Error Handling

✅ DO:
```typescript
interface ApiResponse<T> {
    data: T | null;
    error?: string;
    status: number;
}

async function fetchUserData(userId: string): Promise<ApiResponse<User>> {
    try {
        const response = await api.get(`/users/${userId}`);
        return {
            data: response.data,
            status: 200
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                data: null,
                error: error.message,
                status: error.statusCode
            };
        }
        return {
            data: null,
            error: 'An unexpected error occurred',
            status: 500
        };
    }
}
```

❌ DON'T:
```typescript
function fetchUserData(userId: string) {  // Missing return type
    return api.get('/users/' + userId)  // String concatenation
        .then(response => response.data)  // Prefer async/await
        .catch(error => {
            console.error(error);  // Avoid console.error
            return null;  // Unclear error handling
        });
}
```

### Common Anti-patterns to Avoid (Both Languages)

1. **God Objects/Classes**
❌ DON'T:
```typescript
class UserManager {
    // Too many responsibilities in one class
    async createUser() { /* ... */ }
    async updateProfile() { /* ... */ }
    async sendEmail() { /* ... */ }
    async processPayment() { /* ... */ }
    async generateReport() { /* ... */ }
}
```

2. **Magic Numbers/Strings**
❌ DON'T:
```python
if user.age >= 18:  # Magic number
    if user.status == "A":  # Magic string
        # ...
```

✅ DO:
```python
MINIMUM_AGE = 18
STATUS_ACTIVE = "A"

if user.age >= MINIMUM_AGE:
    if user.status == STATUS_ACTIVE:
        # ...
```

3. **Deep Nesting**
❌ DON'T:
```typescript
function processOrder(order: Order) {
    if (order) {
        if (order.items) {
            if (order.items.length > 0) {
                if (order.status === 'pending') {
                    // ... deeply nested code
                }
            }
        }
    }
}
```

✅ DO:
```typescript
function processOrder(order: Order) {
    if (!order?.items?.length) {
        return;
    }
    
    if (order.status !== 'pending') {
        return;
    }
    
    // Main logic here
}
```

## Testing

- Write unit tests for all new code
- Maintain test coverage above 80%
- Follow AAA pattern (Arrange, Act, Assert)
- Use meaningful test descriptions
- Test both success and failure cases
- Mock external dependencies appropriately
- Keep tests independent and isolated
- Write integration tests for critical paths
- Use appropriate testing frameworks (pytest for Python, Jest for TypeScript, Pest for PHP)
- Implement E2E tests for critical user journeys

## Documentation

- Maintain up-to-date README files
- Document setup and installation procedures
- Include API documentation for public interfaces
- Add inline comments for complex logic
- Document configuration options
- Keep documentation close to the code it describes
- Include examples for common use cases
- Document breaking changes
- Maintain a CHANGELOG
- Include troubleshooting guides for common issues

## Security

- Follow OWASP security guidelines
- Implement proper authentication and authorization
- Sanitize all user inputs (trim, escape, validate)
- Use environment variables for sensitive data
- Implement proper session management
- Use HTTPS for all network communications
- Regular security dependency updates
- Implement rate limiting where appropriate
- Use prepared statements for database queries
- Implement proper CORS policies: Do not use '*'

## Performance

- Optimize database queries
- Implement caching strategies
- Minimize HTTP requests
- Use appropriate data structures
- Implement pagination for large datasets
- Optimize assets (images, scripts, styles)
- Use lazy loading when appropriate
- Monitor memory usage
- Profile code for bottlenecks
- Consider scalability in design decisions

## Accessibility

- Follow WCAG 2.1 guidelines
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation
- Maintain proper color contrast
- Support screen readers
- Implement ARIA labels where needed
- Test with accessibility tools
- Support text resizing
- Provide focus indicators

## Reliability

- Implement proper error handling
- Add logging and monitoring
- Use circuit breakers for external services
- Implement retry mechanisms
- Handle network failures gracefully
- Implement proper backup strategies
- Monitor system health
- Have fallback mechanisms
- Implement proper validation
- Use feature flags for risky changes

## Maintainability

- Follow SOLID principles
- Keep code modular and loosely coupled
- Use dependency injection
- Maintain consistent coding style
- Keep dependencies up to date
- Remove unused code and dependencies
- Write self-documenting code
- Use appropriate abstraction layers
- Maintain proper folder structure
- Regular code refactoring



---

## Tools and Integrations

- **GitHub Actions**: Use workflows to automate tests, builds, and deployments.
- **Linters and Formatters**: Integrate tools like ESLint, Prettier, etc., to ensure code quality.
- **Continuous Integration**: Set up CI/CD pipelines to automate the integration and delivery process.
- **Code Review Tools**: Use tools that facilitate reviews, such as SonarQube, CodeClimate, etc.
- **Communication**: Use platforms like Slack for efficient team communication.
