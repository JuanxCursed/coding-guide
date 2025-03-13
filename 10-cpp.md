# C++: Best Practices Guide

## Modern C++ Style

```cpp
// Use descriptive variable names
int userCount = 42;  // Good
int uc = 42;  // Bad

// Use auto for complex types
auto iterator = myMap.find(key);  // Good
std::map<std::string, std::vector<int>>::iterator iterator = myMap.find(key);  // Verbose

// Use nullptr instead of NULL or 0
void* ptr = nullptr;  // Good
void* ptr = NULL;  // Outdated
void* ptr = 0;  // Confusing

// Use range-based for loops
for (const auto& item : container) {  // Good
    // Use item
}

// Avoid this when possible
for (auto it = container.begin(); it != container.end(); ++it) {  // More verbose
    // Use *it
}

// Use list initialization
std::vector<int> v = {1, 2, 3, 4};  // Good
std::pair<int, std::string> p = {1, "one"};  // Good

// Use enum class instead of enum
enum class Color { Red, Green, Blue };  // Good, strongly typed
enum OldColor { Red, Green, Blue };  // Bad, pollutes namespace
```

## C++ Best Practices

### 1. Resource Management

```cpp
// Use RAII (Resource Acquisition Is Initialization)
// Let destructors handle cleanup

// Bad
void badFunction() {
    int* data = new int[1000];
    // If exception occurs here, memory leaks
    delete[] data;
}

// Good
void goodFunction() {
    // Vector handles memory automatically
    std::vector<int> data(1000);
    // No need to worry about deletion
}

// Use smart pointers, not raw pointers for ownership
// std::unique_ptr for exclusive ownership
std::unique_ptr<Resource> createResource() {
    return std::make_unique<Resource>();
}

// std::shared_ptr for shared ownership
void processResource(std::shared_ptr<Resource> resource) {
    // Multiple references can exist
}

// Pass by reference to avoid copying
void processLargeObject(const LargeObject& obj) {  // Good
    // Use obj
}

void processLargeObject(LargeObject obj) {  // Bad, makes copy
    // Use obj
}

// Use std::optional for optional values (C++17)
std::optional<std::string> findUsername(int id) {
    if (userExists(id))
        return username(id);
    return std::nullopt;
}
```

### 2. Modern Memory Management

```cpp
// Prefer containers over raw arrays
std::vector<int> values = {1, 2, 3, 4};  // Good

// Avoid manual memory management when possible
// Bad
int* values = new int[4]{1, 2, 3, 4};
// ... use values
delete[] values;

// Use make_unique and make_shared
auto resource = std::make_unique<Resource>();  // Good
std::unique_ptr<Resource> resource(new Resource());  // Less good

// Use std::string, not char arrays
std::string name = "John Doe";  // Good
char name[64] = "John Doe";  // Bad

// Use std::array for fixed-size arrays
std::array<int, 4> values = {1, 2, 3, 4};  // Good, fixed size with bounds checking

// Use std::string_view for non-owning views (C++17)
void processName(std::string_view name) {
    // Avoids copying strings
}
```

### 3. Clear Conditional Logic

```cpp
// Bad - complex condition directly in if statement
if (user.age >= 18 && user.isVerified && !user.isBanned && user.subscription.isActive) {
    allowAccess();
}

// Good - using descriptive variables to explain the conditions
bool isAdult = user.age >= 18;
bool isVerified = user.isVerified;
bool isNotBanned = !user.isBanned;
bool hasActiveSubscription = user.subscription.isActive;

if (isAdult && isVerified && isNotBanned && hasActiveSubscription) {
    allowAccess();
}

// Even better - wrap complex conditions in functions with descriptive names
bool canAccessContent(const User& user) {
    bool isAdult = user.age >= 18;
    bool isVerified = user.isVerified;
    bool isNotBanned = !user.isBanned;
    bool hasActiveSubscription = user.subscription.isActive;
    
    return isAdult && isVerified && isNotBanned && hasActiveSubscription;
}

if (canAccessContent(user)) {
    allowAccess();
}

// Using constants for boundary conditions
// Bad - magic numbers
if (temperature > 30) {
    showHeatWarning();
}

// Good - named constants
constexpr double HIGH_TEMPERATURE_THRESHOLD = 30.0;

if (temperature > HIGH_TEMPERATURE_THRESHOLD) {
    showHeatWarning();
}

// Using switch with meaningful enums
enum class OrderStatus { Pending, Processing, Shipped, Delivered, Cancelled };

void processOrder(const Order& order) {
    switch (order.status) {
        case OrderStatus::Pending:
            // Handle pending order
            break;
        case OrderStatus::Processing:
            // Handle processing order
            break;
        case OrderStatus::Shipped:
            // Handle shipped order
            break;
        case OrderStatus::Delivered:
            // Handle delivered order
            break;
        case OrderStatus::Cancelled:
            // Handle cancelled order
            break;
    }
}
```

### 4. Error Handling

```cpp
// Use exceptions for exceptional conditions
// Not for normal flow control
void processFile(const std::string& path) {
    std::ifstream file(path);
    if (!file) {
        throw std::runtime_error("Failed to open file: " + path);
    }
    // Process file
}

// Use try/catch blocks to handle exceptions
void safeFunctionCall() {
    try {
        processFile("data.txt");
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        // Handle error
    }
}

// Consider using std::expected or std::outcome (C++23 or libraries)
// for expected failures

// Use [[nodiscard]] for functions whose return values shouldn't be ignored
[[nodiscard]] bool saveData() {
    // Return true if successful
    return true;
}

// Caller is encouraged to use the return value
if (!saveData()) {
    // Handle failure
}
```

### 5. Performance Considerations

```cpp
// Use reserve for vectors when size is known
std::vector<int> values;
values.reserve(1000);  // Avoids multiple reallocations

// Pass large objects by const reference to avoid copying
void processData(const LargeObject& data) {
    // Use data without copying
}

// Use emplace instead of push_back when constructing elements in place
std::vector<std::pair<int, std::string>> pairs;
pairs.emplace_back(1, "one");  // Good
pairs.push_back(std::make_pair(2, "two"));  // Less efficient

// Use move semantics for transferring ownership
std::unique_ptr<Resource> createResource() {
    auto resource = std::make_unique<Resource>();
    // Configure resource
    return resource;  // Automatically moved
}

// Be aware of Return Value Optimization (RVO)
LargeObject createLargeObject() {
    LargeObject obj;
    // Initialize obj
    return obj;  // Compiler might optimize away the copy/move
}

// Use std::string_view for string parameters you don't modify
void processName(std::string_view name) {
    // Use name without copying the string
}
```

## Modern C++ Features

### 1. Lambda Expressions

```cpp
// Basic lambda
auto add = [](int a, int b) { return a + b; };
int sum = add(5, 3);  // sum = 8

// Lambda capturing variables
int factor = 2;
auto multiply = [factor](int value) { return value * factor; };
int result = multiply(5);  // result = 10

// Mutable lambda
int counter = 0;
auto increment = [counter]() mutable { return ++counter; };
int a = increment();  // a = 1
int b = increment();  // b = 2

// Generic lambda (C++14)
auto genericAdd = [](auto a, auto b) { return a + b; };
int sum = genericAdd(5, 3);  // sum = 8
std::string concat = genericAdd(std::string("Hello, "), std::string("World!"));  // concat = "Hello, World!"
```

### 2. constexpr and consteval

```cpp
// Compile-time computation
constexpr int factorial(int n) {
    return (n <= 1) ? 1 : n * factorial(n - 1);
}

constexpr int fact5 = factorial(5);  // Computed at compile time

// C++20 consteval (guaranteed compile-time evaluation)
consteval int square(int n) {
    return n * n;
}

constexpr int sq5 = square(5);  // Always computed at compile time
```

### 3. Structured Bindings (C++17)

```cpp
// Decompose tuples
std::tuple<int, std::string, double> getData() {
    return {1, "Test", 3.14};
}

auto [id, name, value] = getData();
// Now id = 1, name = "Test", value = 3.14

// Decompose pairs
std::map<std::string, int> ages = {{"Alice", 30}, {"Bob", 25}};

for (const auto& [name, age] : ages) {
    std::cout << name << " is " << age << " years old." << std::endl;
}

// Decompose structs
struct Point { int x; int y; };
Point getPoint() { return {10, 20}; }

auto [x, y] = getPoint();
// Now x = 10, y = 20
```

### 4. Concepts (C++20)

```cpp
// Define a concept
template<typename T>
concept Numeric = std::is_arithmetic_v<T>;

// Use the concept in a function
template<Numeric T>
T add(T a, T b) {
    return a + b;
}

// Multiple constraints
template<typename T>
concept Sortable = requires(T a) {
    std::begin(a);
    std::end(a);
    std::sort(std::begin(a), std::end(a));
};

template<Sortable T>
void sortContainer(T& container) {
    std::sort(std::begin(container), std::end(container));
}
```

### 5. Ranges (C++20)

```cpp
#include <ranges>
#include <vector>
#include <algorithm>

// Using ranges for cleaner algorithms
std::vector<int> numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};

// Filter even numbers and transform them
auto result = numbers
              | std::views::filter([](int n) { return n % 2 == 0; })
              | std::views::transform([](int n) { return n * n; });

// Result contains 4, 16, 36, 64, 100

// Combining multiple operations with ranges
std::vector<std::string> names = {"Alice", "Bob", "Charlie", "David"};

auto filteredNames = names
                     | std::views::filter([](const std::string& name) { return name.size() > 3; })
                     | std::views::transform([](const std::string& name) { return name + "!"; });

// filteredNames contains "Alice!", "Charlie!", "David!"
```

## C++ Testing Best Practices

```cpp
// Using Google Test
#include <gtest/gtest.h>

// Simple test
TEST(MathTest, Addition) {
    EXPECT_EQ(5, 2 + 3);
}

// Test with fixtures
class StringTest : public ::testing::Test {
protected:
    void SetUp() override {
        testString = "Hello, World!";
    }

    std::string testString;
};

TEST_F(StringTest, Length) {
    EXPECT_EQ(13, testString.length());
}

TEST_F(StringTest, Contains) {
    EXPECT_TRUE(testString.find("World") != std::string::npos);
}

// Parameterized tests
class MultiplicationTest : public ::testing::TestWithParam<std::tuple<int, int, int>> {};

TEST_P(MultiplicationTest, Product) {
    auto params = GetParam();
    int a = std::get<0>(params);
    int b = std::get<1>(params);
    int expected = std::get<2>(params);
    
    EXPECT_EQ(expected, a * b);
}

INSTANTIATE_TEST_SUITE_P(
    MultiplicationValues,
    MultiplicationTest,
    ::testing::Values(
        std::make_tuple(1, 1, 1),
        std::make_tuple(2, 3, 6),
        std::make_tuple(5, 5, 25)
    )
);
```

## Concurrency in C++

```cpp
#include <thread>
#include <mutex>
#include <future>

// Basic threading
void processData(const std::vector<int>& data) {
    // Process data
}

void multiThreadedProcessing(const std::vector<int>& allData) {
    // Split data for two threads
    size_t half = allData.size() / 2;
    
    std::vector<int> firstHalf(allData.begin(), allData.begin() + half);
    std::vector<int> secondHalf(allData.begin() + half, allData.end());
    
    std::thread t1(processData, std::ref(firstHalf));
    std::thread t2(processData, std::ref(secondHalf));
    
    t1.join();  // Wait for thread 1 to finish
    t2.join();  // Wait for thread 2 to finish
}

// Using mutexes for thread safety
std::mutex mtx;

void incrementCounter(int& counter, int amount) {
    std::lock_guard<std::mutex> lock(mtx);  // Automatically unlocks when out of scope
    counter += amount;
}

// Using std::async for asynchronous operations
std::vector<int> processDataAsync(const std::vector<int>& data) {
    // Process data and return results
    std::vector<int> results;
    // Fill results
    return results;
}

void asyncExample(const std::vector<int>& allData) {
    // Split data for two async operations
    size_t half = allData.size() / 2;
    
    std::vector<int> firstHalf(allData.begin(), allData.begin() + half);
    std::vector<int> secondHalf(allData.begin() + half, allData.end());
    
    // Launch async tasks
    auto future1 = std::async(std::launch::async, processDataAsync, firstHalf);
    auto future2 = std::async(std::launch::async, processDataAsync, secondHalf);
    
    // Get results
    auto results1 = future1.get();
    auto results2 = future2.get();
    
    // Combine results
    std::vector<int> combinedResults;
    combinedResults.insert(combinedResults.end(), results1.begin(), results1.end());
    combinedResults.insert(combinedResults.end(), results2.begin(), results2.end());
}
```

## Templates and Meta-programming

```cpp
// Basic function template
template<typename T>
T max(T a, T b) {
    return (a > b) ? a : b;
}

// Basic class template
template<typename T>
class Container {
private:
    T value;
    
public:
    Container(T val) : value(val) {}
    
    T getValue() const {
        return value;
    }
};

// Template specialization
template<>
class Container<bool> {
private:
    bool value;
    
public:
    Container(bool val) : value(val) {}
    
    bool getValue() const {
        return value;
    }
    
    bool getNegated() const {
        return !value;
    }
};

// Variadic templates
template<typename T>
T sum(T value) {
    return value;
}

template<typename T, typename... Args>
T sum(T first, Args... args) {
    return first + sum(args...);
}

// Using it
int total = sum(1, 2, 3, 4, 5);  // total = 15

// SFINAE (Substitution Failure Is Not An Error)
template<typename T, 
         typename = std::enable_if_t<std::is_integral_v<T>>>
T doubleValue(T value) {
    return value * 2;
}

// C++20 concepts version
template<std::integral T>
T doubleValue(T value) {
    return value * 2;
}
``` 