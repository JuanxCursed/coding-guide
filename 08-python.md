# Python: Best Practices Guide

## Code Style

```python
# Use descriptive variable names
user_count = 42  # Good
uc = 42  # Bad

# Prefer list comprehensions over loops for simple cases
squares = [x * x for x in range(10)]  # Good
squares = []
for x in range(10):  # Less efficient
    squares.append(x * x)

# Use f-strings for string interpolation
name = "Alice"
age = 30
message = f"Hello, {name}! You are {age} years old."  # Good
message = "Hello, " + name + "! You are " + str(age) + " years old."  # Bad

# Use explicit comparisons
if count == 0:  # Good
    print("Empty")
    
if not user_list:  # Good for checking empty collections
    print("No users")
```

## Python Best Practices

### 1. Readability First

```python
# Use well-named variables and functions
def calculate_average_score(scores):
    """Calculate the average of a list of scores."""
    if not scores:
        return 0
    return sum(scores) / len(scores)

# Add docstrings to functions, classes, and modules
def get_user_by_id(user_id):
    """
    Retrieve a user by their ID.
    
    Args:
        user_id (int): The ID of the user to retrieve.
        
    Returns:
        dict: User information or None if not found.
    """
    # Implementation
    pass

# Avoid deep nesting
# Bad:
def process_data(data):
    if data:
        if 'user' in data:
            if 'preferences' in data['user']:
                if 'theme' in data['user']['preferences']:
                    return data['user']['preferences']['theme']
    return 'default'

# Good:
def process_data(data):
    if not data:
        return 'default'
    
    user = data.get('user', {})
    preferences = user.get('preferences', {})
    return preferences.get('theme', 'default')
```

### 2. Proper Comparisons and Conditionals

```python
# Use is for None, True, False
if user is None:  # Good
    print("No user")
    
if value is True:  # Good
    print("Explicitly True")
    
# Use == for value equality
if count == 0:  # Good
    print("Empty")
    
# Use in for collection membership
if user_id in active_users:  # Good
    print("User is active")
    
# Avoid redundant comparisons
# Bad:
if is_active == True:
    process_active_user()
    
# Good:
if is_active:
    process_active_user()
    
# Use all() and any() for multiple conditions
if all(score > 70 for score in scores):
    print("All scores are above 70")
    
if any(user.is_admin for user in users):
    print("At least one admin user exists")

# Using descriptive variables for complex conditions
# Bad - complex condition directly in if statement
if user.age >= 18 and user.is_verified and not user.is_banned and user.subscription.status == 'active':
    allow_access()

# Good - using descriptive variables to explain the conditions
is_adult = user.age >= 18
is_verified = user.is_verified
is_not_banned = not user.is_banned
has_active_subscription = user.subscription.status == 'active'

if is_adult and is_verified and is_not_banned and has_active_subscription:
    allow_access()

# Even better - wrap complex conditions in functions with descriptive names
def can_access_content(user):
    """Check if user can access premium content."""
    is_adult = user.age >= 18
    is_verified = user.is_verified
    is_not_banned = not user.is_banned
    has_active_subscription = user.subscription.status == 'active'
    
    return is_adult and is_verified and is_not_banned and has_active_subscription

if can_access_content(user):
    allow_access()

# Using variables for boundary conditions
# Bad - magic numbers
if temperature > 30:
    show_heat_warning()

# Good - named constants
HIGH_TEMPERATURE_THRESHOLD = 30

if temperature > HIGH_TEMPERATURE_THRESHOLD:
    show_heat_warning()

# Using variables for business logic clarity
# Bad - unclear price comparison
if price * quantity < 100:
    apply_discount()

# Good - clear business logic
order_total = price * quantity
DISCOUNT_THRESHOLD = 100
is_eligible_for_discount = order_total < DISCOUNT_THRESHOLD

if is_eligible_for_discount:
    apply_discount()

# For date/time comparisons
# Bad - obscure time calculation
import time
if time.time() - user.last_login_timestamp > 60 * 60 * 24 * 30:
    prompt_for_relogin()

# Good - clear time variables
THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30
time_since_last_login = time.time() - user.last_login_timestamp
is_login_expired = time_since_last_login > THIRTY_DAYS_IN_SECONDS

if is_login_expired:
    prompt_for_relogin()

# Using variables for regex or complex pattern matching
import re

# Bad - complex regex directly in if
if re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
    send_verification_email(email)

# Good - named pattern with explanation
EMAIL_PATTERN = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
is_valid_email = re.match(EMAIL_PATTERN, email) is not None

if is_valid_email:
    send_verification_email(email)
```

### 3. Working with Collections

```python
# Use list comprehensions for simple transformations
uppercase_names = [name.upper() for name in names]

# Use dictionary comprehensions
name_to_age = {user.name: user.age for user in users}

# Use generator expressions for large datasets
sum_of_squares = sum(x * x for x in range(1000000))

# Prefer defaultdict for handling default values
from collections import defaultdict
user_scores = defaultdict(list)
for name, score in scores_data:
    user_scores[name].append(score)

# Use Counter for counting
from collections import Counter
word_counts = Counter(document.split())
most_common = word_counts.most_common(10)

# Use sets for membership testing and removing duplicates
unique_tags = set(all_tags)
if tag in unique_tags:
    print("Tag exists")
```

### 4. Error Handling

```python
# Use specific exceptions
try:
    user = get_user(user_id)
except UserNotFoundError:
    # Handle specific error
    create_user(user_id)
except DatabaseError:
    # Handle different error
    log_error("Database error")
finally:
    # Always executed
    close_connection()

# Context managers for resource management
with open('data.txt', 'r') as file:
    content = file.read()
# File automatically closed

# Custom context managers
from contextlib import contextmanager

@contextmanager
def database_connection():
    connection = create_connection()
    try:
        yield connection
    finally:
        connection.close()

with database_connection() as conn:
    conn.execute("SELECT * FROM users")
```

### 5. Async Programming

```python
import asyncio

# Basic async function
async def fetch_data(url):
    """Asynchronously fetch data from a URL."""
    # Placeholder for actual async HTTP request
    await asyncio.sleep(1)  # Simulate network delay
    return {"data": "example"}

# Multiple async operations
async def fetch_multiple_users(user_ids):
    tasks = [fetch_user(user_id) for user_id in user_ids]
    # Run all tasks concurrently
    results = await asyncio.gather(*tasks)
    return results

# Async with timeouts
async def fetch_with_timeout(url, timeout=5.0):
    try:
        async with asyncio.timeout(timeout):
            return await fetch_data(url)
    except asyncio.TimeoutError:
        return {"error": "Request timed out"}

# FastAPI example (web framework)
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    # Async database operation
    user = await db.fetch_one("SELECT * FROM users WHERE id = :id", {"id": user_id})
    if not user:
        return {"error": "User not found"}
    return {"user": user}
```

### 6. Use of Constants

```python
# Define constants at the module level using UPPER_SNAKE_CASE
MAX_LOGIN_ATTEMPTS = 5
DEFAULT_TIMEOUT_SECONDS = 30
BASE_API_URL = "https://api.example.com/v1"

# Group related constants in classes
class HttpStatus:
    OK = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    SERVER_ERROR = 500

# Use enum for related constants
from enum import Enum, auto

class UserRole(Enum):
    ADMIN = auto()
    EDITOR = auto()
    VIEWER = auto()

# Use constants instead of magic numbers/strings
# Bad:
if response.status_code == 200:
    process_data(response.json())

# Good:
if response.status_code == HttpStatus.OK:
    process_data(response.json())

# Bad:
if user.role == "admin":
    show_admin_panel()

# Good:
if user.role == UserRole.ADMIN:
    show_admin_panel()
```

## Performance Tips

### 1. Use Appropriate Data Structures

```python
# Use sets for fast membership testing
valid_usernames = set(all_usernames)
if username in valid_usernames:  # O(1) operation
    print("Username is valid")

# Use dictionaries for lookups
user_data = {user.id: user for user in users}
if user_id in user_data:  # O(1) operation
    process_user(user_data[user_id])
```

### 2. Optimize Loops

```python
# Avoid creating unnecessary intermediate lists
# Less efficient:
filtered_values = [x for x in values if x > 0]
squared_values = [x * x for x in filtered_values]

# More efficient (single pass):
squared_positives = [x * x for x in values if x > 0]

# Move expensive operations outside of loops
import re
pattern = re.compile(r'\d+')  # Compile once, use many times

for text in text_list:
    matches = pattern.findall(text)  # Reuses compiled pattern
```

### 3. Use Built-in Functions and Libraries

```python
# Use built-in functions when possible
# Less efficient:
sum_value = 0
for num in numbers:
    sum_value += num
    
# More efficient:
sum_value = sum(numbers)

# Use specialized libraries
import numpy as np

# NumPy operations are much faster for numerical computations
array = np.array([1, 2, 3, 4, 5])
squared = array ** 2  # Vectorized operation
```

### 4. Memoization for Expensive Calculations

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    """Calculate the Fibonacci number recursively with caching."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# The function will only compute each fibonacci(n) once,
# storing and reusing the results for subsequent calls
```

### 5. Use Generators for Large Data Sets

```python
# Memory-intensive for large ranges:
large_list = [i for i in range(10000000)]

# Memory-efficient:
large_gen = (i for i in range(10000000))

# Process large files efficiently
def process_large_file(filename):
    with open(filename, 'r') as file:
        for line in file:  # Reads one line at a time, not the whole file
            process_line(line)
```

## Testing Best Practices

```python
# Using pytest for testing
import pytest
from myapp.user import get_user_role

def test_get_user_role_admin():
    # Arrange
    user = {"id": 1, "role": "admin"}
    
    # Act
    role = get_user_role(user)
    
    # Assert
    assert role == "admin"

def test_get_user_role_missing():
    # Arrange
    user = {"id": 1}  # No role
    
    # Act
    role = get_user_role(user)
    
    # Assert
    assert role == "guest"  # Default role

# Parametrized tests
@pytest.mark.parametrize("input_value,expected", [
    (1, 1),
    (2, 4),
    (3, 9),
    (4, 16),
])
def test_square(input_value, expected):
    assert input_value ** 2 == expected

# Fixtures for reusable test setups
@pytest.fixture
def user_database():
    # Setup
    db = {
        1: {"name": "Alice", "role": "admin"},
        2: {"name": "Bob", "role": "user"}
    }
    yield db
    # Teardown (if needed)
    pass

def test_get_user(user_database):
    user = get_user(user_database, 1)
    assert user["name"] == "Alice"
```

## Virtual Environments and Dependencies

```bash
# Create a virtual environment
python -m venv venv

# Activate it (Windows)
venv\Scripts\activate

# Activate it (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Use Poetry for dependency management
poetry init
poetry add requests
poetry add pytest --dev
```

## Python with FastAPI and SQLAlchemy

```python
# FastAPI with dependency injection and SQLAlchemy
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas
from .database import SessionLocal, engine

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(email=user.email, hashed_password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

## Type Hints and Annotations

```python
from typing import List, Dict, Optional, Union, Any, Callable, TypeVar, Generic

# Basic type hints
def greet(name: str) -> str:
    return f"Hello, {name}!"

# Complex type hints
def process_user_data(
    user_id: int,
    data: Dict[str, Any],
    callback: Optional[Callable[[bool], None]] = None
) -> Dict[str, Union[str, int]]:
    result = {"status": "success", "id": user_id}
    if callback:
        callback(True)
    return result

# Generic types
T = TypeVar('T')

def first_element(items: List[T]) -> Optional[T]:
    return items[0] if items else None

# Type hints with classes
class UserRepository:
    def get_by_id(self, user_id: int) -> Optional['User']:
        # Implementation
        pass
    
    def get_all(self) -> List['User']:
        # Implementation
        pass
``` 