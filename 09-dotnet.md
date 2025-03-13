 # .NET: Best Practices Guide

## Code Style

```csharp
// Use meaningful, descriptive names
public int CountActiveUsers() // Good
public int Count() // Too generic

// Prefer expression-bodied members for simple methods
public string GetFullName() => $"{FirstName} {LastName}";

// Use string interpolation instead of concatenation
var message = $"Hello, {user.Name}!"; // Good
var message = "Hello, " + user.Name + "!"; // Less readable

// Use pattern matching for type checking and casting
if (entity is Customer customer)
{
    // Use customer directly without casting
}

// Use null conditional and coalescing operators
var name = user?.Name ?? "Anonymous";
```

## C# Best Practices

### 1. SOLID Principles

```csharp
// Single Responsibility Principle
// Classes should have only one reason to change
public class CustomerRepository
{
    // Handles ONLY data access for customers
    public Customer GetById(int id) => /* database access */;
    public void Save(Customer customer) => /* database access */;
}

public class CustomerValidator 
{
    // Handles ONLY validation of customers
    public bool IsValid(Customer customer) => /* validation logic */;
}

// Open/Closed Principle
// Open for extension, closed for modification
public abstract class PaymentProcessor
{
    public abstract Task<PaymentResult> ProcessPayment(Payment payment);
}

public class CreditCardProcessor : PaymentProcessor
{
    public override Task<PaymentResult> ProcessPayment(Payment payment) 
        => /* Credit card logic */;
}

public class PayPalProcessor : PaymentProcessor
{
    public override Task<PaymentResult> ProcessPayment(Payment payment) 
        => /* PayPal logic */;
}

// Liskov Substitution Principle
// Subtypes must be substitutable for their base types
public interface IRepository<T>
{
    T GetById(int id);
    void Save(T entity);
    void Delete(T entity);
}

public class CustomerRepository : IRepository<Customer>
{
    // Must implement all methods correctly
}

// Interface Segregation Principle
// Many specific interfaces are better than one general-purpose one
public interface IReadOnlyRepository<T>
{
    T GetById(int id);
    IEnumerable<T> GetAll();
}

public interface IWriteOnlyRepository<T>
{
    void Save(T entity);
    void Delete(T entity);
}

// Dependency Inversion Principle
// Depend on abstractions, not concrete implementations
public class OrderService
{
    private readonly IRepository<Order> _orderRepository;
    
    // Inject the dependency
    public OrderService(IRepository<Order> orderRepository)
    {
        _orderRepository = orderRepository;
    }
    
    public Order GetOrder(int id) => _orderRepository.GetById(id);
}
```

### 2. Asynchronous Programming

```csharp
// Use async/await for I/O-bound operations
public async Task<Customer> GetCustomerAsync(int id)
{
    return await _dbContext.Customers.FindAsync(id);
}

// Use proper naming convention for async methods
public async Task ProcessOrderAsync() // Good
public async Task ProcessOrder() // Missing Async suffix

// Use ConfigureAwait(false) in library code
public async Task<Data> GetDataFromServiceAsync()
{
    var response = await _httpClient.GetAsync("api/data")
        .ConfigureAwait(false);
    return await response.Content.ReadAsAsync<Data>()
        .ConfigureAwait(false);
}

// Use Task.WhenAll for parallel execution
public async Task ProcessMultipleOrdersAsync(IEnumerable<Order> orders)
{
    var tasks = orders.Select(ProcessOrderAsync);
    await Task.WhenAll(tasks);
}

// Don't use async void except for event handlers
public async void Button_Click(object sender, EventArgs e)
{
    await ProcessOrderAsync();
}

// Use CancellationToken for cancellable operations
public async Task<Data> GetDataAsync(CancellationToken cancellationToken = default)
{
    return await _httpClient.GetFromJsonAsync<Data>("api/data", cancellationToken);
}
```

### 3. Clear Conditional Logic

```csharp
// Bad - complex condition directly in if statement
if (user.Age >= 18 && user.IsVerified && !user.IsBanned && user.Subscription.IsActive)
{
    AllowAccess();
}

// Good - using descriptive variables to explain the conditions
bool isAdult = user.Age >= 18;
bool isVerified = user.IsVerified;
bool isNotBanned = !user.IsBanned;
bool hasActiveSubscription = user.Subscription.IsActive;

if (isAdult && isVerified && isNotBanned && hasActiveSubscription)
{
    AllowAccess();
}

// Even better - wrap complex conditions in methods with descriptive names
public bool CanAccessContent(User user)
{
    bool isAdult = user.Age >= 18;
    bool isVerified = user.IsVerified;
    bool isNotBanned = !user.IsBanned;
    bool hasActiveSubscription = user.Subscription.IsActive;
    
    return isAdult && isVerified && isNotBanned && hasActiveSubscription;
}

if (CanAccessContent(user))
{
    AllowAccess();
}

// Using constants for boundary conditions
// Bad - magic numbers
if (temperature > 30)
{
    ShowHeatWarning();
}

// Good - named constants
const double HighTemperatureThreshold = 30;

if (temperature > HighTemperatureThreshold)
{
    ShowHeatWarning();
}

// Use switch expressions for multi-condition logic (C# 8+)
public string GetDiscountLevel(decimal purchaseTotal) => purchaseTotal switch
{
    <= 50 => "None",
    > 50 and <= 100 => "Bronze",
    > 100 and <= 500 => "Silver",
    > 500 => "Gold",
};
```

### 4. Exception Handling

```csharp
// Use specific exceptions
public Customer GetCustomer(int id)
{
    if (id <= 0)
    {
        throw new ArgumentException("Customer ID must be positive", nameof(id));
    }
    
    var customer = _repository.GetById(id);
    if (customer == null)
    {
        throw new CustomerNotFoundException(id);
    }
    
    return customer;
}

// Use try/catch only when you can handle the exception
public bool TryGetCustomer(int id, out Customer customer)
{
    try
    {
        customer = GetCustomer(id);
        return true;
    }
    catch (CustomerNotFoundException)
    {
        customer = null;
        return false;
    }
}

// Prefer exception filters
try
{
    ProcessOrder(order);
}
catch (DbException ex) when (ex.ErrorCode == 1205) // Deadlock
{
    // Retry logic
}
catch (DbException ex)
{
    // Other DB errors
}

// Use using statements for IDisposable resources
using (var connection = new SqlConnection(connectionString))
{
    // Use the connection
} // Automatically disposed

// C# 8+ simplified using statements
using var connection = new SqlConnection(connectionString);
// Use the connection
// Automatically disposed at the end of the scope
```

### 5. Performance Considerations

```csharp
// Use StringBuilder for string concatenation in loops
var sb = new StringBuilder();
foreach (var item in items)
{
    sb.Append(item.ToString());
}
var result = sb.ToString();

// Prefer LINQ methods over query syntax for readability
// Good
var adults = people.Where(p => p.Age >= 18).ToList();

// Less common in professional code
var adults = (from p in people 
             where p.Age >= 18
             select p).ToList();

// Use IEnumerable<T> for returned collections that don't need materialization
public IEnumerable<Customer> GetCustomersByRegion(string region)
{
    return _customers.Where(c => c.Region == region);
}

// Use appropriate collection types
// List<T> for general-purpose dynamic collections
var customers = new List<Customer>();

// Dictionary<TKey, TValue> for key-value lookups
var customerById = new Dictionary<int, Customer>();

// HashSet<T> for unique collections with fast lookup
var processedIds = new HashSet<int>();

// Use ValueTuple for lightweight, unnamed return values (C# 7+)
public (bool IsValid, string ErrorMessage) ValidateUser(User user)
{
    if (string.IsNullOrEmpty(user.Name))
    {
        return (false, "Name is required");
    }
    return (true, string.Empty);
}
```

## Modern .NET Features

### 1. Nullable Reference Types (C# 8+)

```csharp
#nullable enable

// Non-nullable reference type
public string Name { get; set; } = ""; // Must be initialized

// Nullable reference type
public string? Description { get; set; } // Can be null

public void ProcessName(string name) // name cannot be null
{
    // No null check needed
    Console.WriteLine(name.Length);
}

public void ProcessDescription(string? description) // description can be null
{
    // Null check required
    if (description != null)
    {
        Console.WriteLine(description.Length);
    }
    
    // Or use the null-conditional operator
    Console.WriteLine(description?.Length ?? 0);
}
```

### 2. Records (C# 9+)

```csharp
// Immutable record type with value semantics
public record Person(string FirstName, string LastName, int Age);

// Usage
var person1 = new Person("John", "Doe", 30);
var person2 = new Person("John", "Doe", 30);

// Value equality
bool areEqual = person1 == person2; // true

// Non-destructive mutation
var person3 = person1 with { Age = 31 };
```

### 3. Top-level Statements (C# 9+)

```csharp
// Program.cs - No need for explicit Program class and Main method
using System;

Console.WriteLine("Hello World!");

// Application logic goes here
var result = DoSomething();
Console.WriteLine(result);

// Helper methods can be defined after the top-level statements
string DoSomething()
{
    return "Result";
}
```

### 4. Pattern Matching (C# 9+)

```csharp
// Type patterns
public string Describe(object obj) => obj switch
{
    Person p => $"Person: {p.FirstName} {p.LastName}",
    Order o => $"Order: {o.OrderNumber}",
    null => "Null object",
    _ => "Unknown type"
};

// Property patterns
public string GetDeliveryStatus(Order order) => order.Status switch
{
    OrderStatus.Pending => "Not shipped yet",
    OrderStatus.Shipped { TrackingNumber: not null } => $"In transit: {order.TrackingNumber}",
    OrderStatus.Shipped => "Shipped but no tracking available",
    OrderStatus.Delivered => "Delivered",
    _ => "Unknown status"
};

// Relational patterns
public string GetTemperatureCategory(double celsius) => celsius switch
{
    < 0 => "Freezing",
    >= 0 and < 15 => "Cold",
    >= 15 and < 25 => "Moderate",
    >= 25 and < 30 => "Warm",
    >= 30 => "Hot"
};
```

### 5. Dependency Injection with .NET Core

```csharp
// Startup.cs in ASP.NET Core
public void ConfigureServices(IServiceCollection services)
{
    // Register services with DI container
    
    // Transient: created each time they're requested
    services.AddTransient<IEmailSender, EmailSender>();
    
    // Scoped: created once per client request
    services.AddScoped<IOrderProcessor, OrderProcessor>();
    
    // Singleton: created once for the application lifetime
    services.AddSingleton<ICacheService, RedisCacheService>();
    
    // Register options
    services.Configure<EmailSettings>(Configuration.GetSection("Email"));
}

// Controller with injected dependencies
public class OrdersController : ControllerBase
{
    private readonly IOrderProcessor _orderProcessor;
    private readonly ILogger<OrdersController> _logger;
    
    public OrdersController(
        IOrderProcessor orderProcessor,
        ILogger<OrdersController> logger)
    {
        _orderProcessor = orderProcessor;
        _logger = logger;
    }
    
    // Controller actions
}
```

## Testing Best Practices

```csharp
// Using xUnit
public class CustomerServiceTests
{
    [Fact]
    public void GetCustomer_WithValidId_ReturnsCustomer()
    {
        // Arrange
        var mockRepo = new Mock<ICustomerRepository>();
        mockRepo.Setup(repo => repo.GetById(1))
                .Returns(new Customer { Id = 1, Name = "Test" });
                
        var service = new CustomerService(mockRepo.Object);
        
        // Act
        var result = service.GetCustomer(1);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        Assert.Equal("Test", result.Name);
    }
    
    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public void GetCustomer_WithInvalidId_ThrowsArgumentException(int id)
    {
        // Arrange
        var service = new CustomerService(Mock.Of<ICustomerRepository>());
        
        // Act & Assert
        var exception = Assert.Throws<ArgumentException>(() => service.GetCustomer(id));
        Assert.Contains("Customer ID", exception.Message);
    }
}
```

## Entity Framework Core Best Practices

```csharp
// Use async methods for database operations
public async Task<List<Customer>> GetCustomersAsync()
{
    return await _context.Customers
        .Where(c => c.IsActive)
        .ToListAsync();
}

// Use Include for eager loading related entities
public async Task<Order> GetOrderWithDetailsAsync(int id)
{
    return await _context.Orders
        .Include(o => o.Customer)
        .Include(o => o.Items)
            .ThenInclude(i => i.Product)
        .FirstOrDefaultAsync(o => o.Id == id);
}

// Use projection to select only needed fields
public async Task<List<CustomerDto>> GetCustomerNamesAsync()
{
    return await _context.Customers
        .Select(c => new CustomerDto 
        { 
            Id = c.Id, 
            FullName = $"{c.FirstName} {c.LastName}" 
        })
        .ToListAsync();
}

// Use AsNoTracking for read-only queries
public async Task<List<Product>> GetProductsForDisplayAsync()
{
    return await _context.Products
        .AsNoTracking()
        .Where(p => p.IsActive)
        .ToListAsync();
}

// Use transactions for multiple operations
public async Task CreateOrderWithItemsAsync(Order order, List<OrderItem> items)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    
    try
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        
        foreach (var item in items)
        {
            item.OrderId = order.Id;
            _context.OrderItems.Add(item);
        }
        
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
```