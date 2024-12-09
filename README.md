# :computer:Code Standards and Code Review Guidelines


# Code Review
## Everyone

- Accept that many programming decisions are opinions. Discuss tradeoffs, which
  you prefer, and reach a resolution quickly.
- Ask good questions; don't make demands. ("What do you think about naming this
  `:user_id`?")
- Good questions avoid judgment and avoid assumptions about the author's
  perspective.
- Ask for clarification. ("I didn't understand. Can you clarify?")
- Avoid selective ownership of code. ("mine", "not mine", "yours")
- Avoid using terms that could be seen as referring to personal traits. ("dumb",
  "stupid"). Assume everyone is intelligent and well-meaning.
- Be explicit. Remember people don't always understand your intentions online.
- Be humble. ("I'm not sure - let's look it up.")
- Don't use hyperbole. ("always", "never", "endlessly", "nothing")
- Don't use sarcasm.
- Keep it real. If emoji, animated gifs, or humor aren't you, don't force them.
  If they are, use them with aplomb.
- Talk synchronously (e.g. chat, screen-sharing, in person) if there are too
  many "I didn't understand" or "Alternative solution:" comments. Post a
  follow-up comment summarizing the discussion.

## Having Your Code Reviewed

- Be grateful for the reviewer's suggestions. ("Good call. I'll make that
  change.")
- Be aware that it can be [challenging to convey emotion and intention online]
- Explain why the code exists. ("It's like that because of these reasons. Would
  it be more clear if I rename this class/file/method/variable?")
- Extract some changes and refactoring into future tickets/stories.
- Link to the code review from the ticket/story. ("Ready for review:
  https://github.com/organization/project/pull/1")
- Push commits based on earlier rounds of feedback as isolated commits to the
  branch. Do not squash until the branch is ready to merge. Reviewers should be
  able to read individual updates based on their earlier feedback.
- Seek to understand the reviewer's perspective.
- Try to respond to every comment.
- Wait to merge the branch until continuous integration (TDDium, Travis CI,
  CircleCI, etc.) tells you the test suite is green in the branch.
- Merge once you feel confident in the code and its impact on the project.
- Final editorial control rests with the pull request author.

[challenging to convey emotion and intention online]: https://thoughtbot.com/blog/empathy-online

## Reviewing Code

Understand why the change is necessary (fixes a bug, improves the user
experience, refactors the existing code). Then:

- Communicate which ideas you feel strongly about and those you don't.
- Identify ways to simplify the code while still solving the problem.
- If discussions turn too philosophical or academic, move the discussion offline
  to a regular Friday afternoon technique discussion. In the meantime, let the
  author make the final decision on alternative implementations.
- Offer alternative implementations, but assume the author already considered
  them. ("What do you think about using a custom validator here?")
- Seek to understand the author's perspective.
- Sign off on the pull request with a 👍 or "Ready to merge" comment.
- Remember that you are here to provide feedback, not to be a gatekeeper.

## Style Comments

Reviewers should comment on missed style guidelines. Example comment:

    > Order resourceful routes alphabetically by name.

An example response to style comments:

    Whoops. Good catch, thanks. Fixed in a4994ec.

If you disagree with a guideline, open an issue on the guides repo rather than
debating it within the code review. In the meantime, apply the guideline.
It's often helpful to set up a linter like [standard] to format code automatically.
This helps us have more meaningful conversations on PRs rather than debating
personal style preferences.

[standard]: https://github.com/testdouble/standard

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
// Interfaces (PascalCase with I prefix)
interface IUserProfile {
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
interface IUserRepository {
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
interface IApiResponse<T> {
    data: T | null;
    error?: string;
    status: number;
}

async function fetchUserData(userId: string): Promise<IApiResponse<User>> {
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
- Use appropriate testing frameworks (pytest for Python, Jest for TypeScript)
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
- Sanitize all user inputs
- Use environment variables for sensitive data
- Implement proper session management
- Use HTTPS for all network communications
- Regular security dependency updates
- Implement rate limiting where appropriate
- Use prepared statements for database queries
- Implement proper CORS policies

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
