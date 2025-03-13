# Unity: Best Practices Guide

## C# Scripting in Unity

```csharp
// Use proper naming conventions
public class PlayerController : MonoBehaviour // PascalCase for class names
{
    // Public fields visible in Inspector
    public float moveSpeed = 5f; // camelCase for variables
    
    // Serialize private fields to make them visible in Inspector
    [SerializeField] 
    private float _jumpForce = 10f; // Use _prefix for private fields
    
    // Properties (preferred over public fields)
    public int Health { get; private set; } = 100;
    
    // Cache component references
    private Rigidbody _rigidbody;
    private Animator _animator;
    
    // Initialize in Awake, not in constructor
    private void Awake()
    {
        // Cache component references
        _rigidbody = GetComponent<Rigidbody>();
        _animator = GetComponent<Animator>();
    }
    
    // Use Start for initialization that depends on other GameObjects
    private void Start()
    {
        // Initialize game state
        Health = CalculateStartingHealth();
    }
    
    // Update is called once per frame (use for input and state changes)
    private void Update()
    {
        ProcessInput();
        UpdateAnimations();
    }
    
    // FixedUpdate is called at fixed intervals (use for physics)
    private void FixedUpdate()
    {
        ApplyMovement();
    }
    
    // Break functionality into separate methods
    private void ProcessInput()
    {
        // Handle input logic
    }
    
    private void UpdateAnimations()
    {
        // Update animations based on state
    }
    
    private void ApplyMovement()
    {
        // Apply physics movement
    }
    
    private int CalculateStartingHealth()
    {
        // Calculate starting health
        return 100;
    }
}
```

## Clear Conditional Logic in Unity Scripts

```csharp
// Bad - complex condition directly in if statement
if (player.Health > 0 && !player.IsStunned && player.Stamina > 10 && !gameManager.IsPaused && Input.GetButtonDown("Attack"))
{
    ExecuteAttack();
}

// Good - using descriptive variables to explain the conditions
bool isPlayerAlive = player.Health > 0;
bool isNotStunned = !player.IsStunned;
bool hasEnoughStamina = player.Stamina > 10;
bool isGameActive = !gameManager.IsPaused;
bool isAttackButtonPressed = Input.GetButtonDown("Attack");

bool canExecuteAttack = isPlayerAlive && isNotStunned && hasEnoughStamina && isGameActive;

if (canExecuteAttack && isAttackButtonPressed)
{
    ExecuteAttack();
}

// Even better - wrap complex conditions in methods with descriptive names
private bool CanPlayerAttack()
{
    bool isPlayerAlive = player.Health > 0;
    bool isNotStunned = !player.IsStunned;
    bool hasEnoughStamina = player.Stamina > 10;
    bool isGameActive = !gameManager.IsPaused;
    
    return isPlayerAlive && isNotStunned && hasEnoughStamina && isGameActive;
}

private void Update()
{
    if (CanPlayerAttack() && Input.GetButtonDown("Attack"))
    {
        ExecuteAttack();
    }
}

// Using constants for game design values
// Bad - magic numbers
if (distanceToTarget < 3f)
{
    ActivatePickup();
}

// Good - named constants
private const float PICKUP_RANGE = 3f;

if (distanceToTarget < PICKUP_RANGE)
{
    ActivatePickup();
}

// Even better - move configuration to ScriptableObjects
[CreateAssetMenu(fileName = "PlayerSettings", menuName = "Game/Player Settings")]
public class PlayerSettings : ScriptableObject
{
    public float pickupRange = 3f;
    public float moveSpeed = 5f;
    public float jumpForce = 10f;
}

// Then in your script:
[SerializeField] private PlayerSettings _settings;

if (distanceToTarget < _settings.pickupRange)
{
    ActivatePickup();
}
```

## Unity Architecture Patterns

### 1. Singleton Pattern (Use Carefully)

```csharp
// Singleton with lazy initialization
public class GameManager : MonoBehaviour
{
    private static GameManager _instance;
    
    // Public property with thread safety
    public static GameManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = FindObjectOfType<GameManager>();
                
                if (_instance == null)
                {
                    GameObject managerObject = new GameObject("GameManager");
                    _instance = managerObject.AddComponent<GameManager>();
                }
            }
            
            return _instance;
        }
    }
    
    private void Awake()
    {
        // Ensure only one instance exists
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        _instance = this;
        DontDestroyOnLoad(gameObject);
    }
    
    // Game manager functionality...
}

// Usage
GameManager.Instance.StartNewGame();
```

### 2. State Pattern

```csharp
// State interface
public interface IPlayerState
{
    void Enter(PlayerController player);
    void Update(PlayerController player);
    void FixedUpdate(PlayerController player);
    void Exit(PlayerController player);
}

// Concrete state
public class PlayerIdleState : IPlayerState
{
    public void Enter(PlayerController player)
    {
        player.Animator.Play("Idle");
    }
    
    public void Update(PlayerController player)
    {
        // Check for state transitions
        if (Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0)
        {
            player.TransitionToState(new PlayerMovingState());
        }
        
        if (Input.GetButtonDown("Jump"))
        {
            player.TransitionToState(new PlayerJumpingState());
        }
    }
    
    public void FixedUpdate(PlayerController player)
    {
        // Apply physics if needed
    }
    
    public void Exit(PlayerController player)
    {
        // Clean up
    }
}

// Player controller using states
public class PlayerController : MonoBehaviour
{
    public Animator Animator { get; private set; }
    public Rigidbody Rigidbody { get; private set; }
    
    private IPlayerState _currentState;
    
    private void Awake()
    {
        Animator = GetComponent<Animator>();
        Rigidbody = GetComponent<Rigidbody>();
    }
    
    private void Start()
    {
        TransitionToState(new PlayerIdleState());
    }
    
    private void Update()
    {
        _currentState?.Update(this);
    }
    
    private void FixedUpdate()
    {
        _currentState?.FixedUpdate(this);
    }
    
    public void TransitionToState(IPlayerState newState)
    {
        _currentState?.Exit(this);
        _currentState = newState;
        _currentState?.Enter(this);
    }
}
```

### 3. Event System

```csharp
// Event manager using C# events
public class GameEvents : MonoBehaviour
{
    // Singleton instance
    public static GameEvents Instance { get; private set; }
    
    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }
    
    // Define events
    public event Action<int> OnScoreChanged;
    public event Action<float> OnPlayerHealthChanged;
    public event Action OnGameOver;
    public event Action<GameObject> OnEnemyDefeated;
    
    // Methods to trigger events
    public void ScoreChanged(int newScore)
    {
        OnScoreChanged?.Invoke(newScore);
    }
    
    public void PlayerHealthChanged(float newHealth)
    {
        OnPlayerHealthChanged?.Invoke(newHealth);
    }
    
    public void GameOver()
    {
        OnGameOver?.Invoke();
    }
    
    public void EnemyDefeated(GameObject enemy)
    {
        OnEnemyDefeated?.Invoke(enemy);
    }
}

// Usage example:
// Subscribe to events
void OnEnable()
{
    GameEvents.Instance.OnScoreChanged += UpdateScoreUI;
    GameEvents.Instance.OnGameOver += ShowGameOverScreen;
}

// Unsubscribe from events
void OnDisable()
{
    GameEvents.Instance.OnScoreChanged -= UpdateScoreUI;
    GameEvents.Instance.OnGameOver -= ShowGameOverScreen;
}

// Event handlers
void UpdateScoreUI(int newScore)
{
    scoreText.text = $"Score: {newScore}";
}

void ShowGameOverScreen()
{
    gameOverPanel.SetActive(true);
}

// Triggering events
public void AddScore(int points)
{
    currentScore += points;
    GameEvents.Instance.ScoreChanged(currentScore);
}
```

### 4. Component-Based Design

```csharp
// Health component
public class HealthComponent : MonoBehaviour
{
    [SerializeField] private float _maxHealth = 100f;
    private float _currentHealth;
    
    public float CurrentHealth => _currentHealth;
    public float MaxHealth => _maxHealth;
    
    public event Action<float> OnHealthChanged;
    public event Action OnDeath;
    
    private void Awake()
    {
        _currentHealth = _maxHealth;
    }
    
    public void TakeDamage(float amount)
    {
        _currentHealth = Mathf.Max(0, _currentHealth - amount);
        OnHealthChanged?.Invoke(_currentHealth);
        
        if (_currentHealth <= 0)
        {
            OnDeath?.Invoke();
        }
    }
    
    public void Heal(float amount)
    {
        _currentHealth = Mathf.Min(_maxHealth, _currentHealth + amount);
        OnHealthChanged?.Invoke(_currentHealth);
    }
}

// Damage dealer component
public class DamageDealerComponent : MonoBehaviour
{
    [SerializeField] private float _damageAmount = 10f;
    
    private void OnCollisionEnter(Collision collision)
    {
        HealthComponent health = collision.gameObject.GetComponent<HealthComponent>();
        
        if (health != null)
        {
            health.TakeDamage(_damageAmount);
        }
    }
}

// Movement component
public class MovementComponent : MonoBehaviour
{
    [SerializeField] private float _moveSpeed = 5f;
    [SerializeField] private float _rotationSpeed = 90f;
    
    private Rigidbody _rigidbody;
    
    private void Awake()
    {
        _rigidbody = GetComponent<Rigidbody>();
    }
    
    public void Move(Vector3 direction)
    {
        Vector3 moveVector = direction.normalized * _moveSpeed * Time.deltaTime;
        _rigidbody.MovePosition(_rigidbody.position + moveVector);
    }
    
    public void Rotate(float angle)
    {
        transform.Rotate(0, angle * _rotationSpeed * Time.deltaTime, 0);
    }
}
```

## Unity Optimization Techniques

### 1. Object Pooling

```csharp
public class ObjectPool : MonoBehaviour
{
    [System.Serializable]
    public class Pool
    {
        public string tag;
        public GameObject prefab;
        public int size;
    }
    
    // Singleton instance
    public static ObjectPool Instance { get; private set; }
    
    [SerializeField] private List<Pool> _pools;
    
    private Dictionary<string, Queue<GameObject>> _poolDictionary;
    
    private void Awake()
    {
        Instance = this;
        
        _poolDictionary = new Dictionary<string, Queue<GameObject>>();
        
        foreach (Pool pool in _pools)
        {
            Queue<GameObject> objectPool = new Queue<GameObject>();
            
            GameObject parent = new GameObject($"{pool.tag} Pool");
            parent.transform.SetParent(transform);
            
            for (int i = 0; i < pool.size; i++)
            {
                GameObject obj = Instantiate(pool.prefab, parent.transform);
                obj.SetActive(false);
                objectPool.Enqueue(obj);
            }
            
            _poolDictionary.Add(pool.tag, objectPool);
        }
    }
    
    public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
    {
        if (!_poolDictionary.ContainsKey(tag))
        {
            Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
            return null;
        }
        
        Queue<GameObject> pool = _poolDictionary[tag];
        
        // If no objects are available, expand the pool
        if (pool.Count == 0)
        {
            Pool originalPool = _pools.Find(p => p.tag == tag);
            GameObject parent = GameObject.Find($"{tag} Pool");
            GameObject obj = Instantiate(originalPool.prefab, parent.transform);
            return ConfigurePoolObject(obj, position, rotation);
        }
        
        // Get an object from the pool
        GameObject pooledObject = pool.Dequeue();
        return ConfigurePoolObject(pooledObject, position, rotation);
    }
    
    private GameObject ConfigurePoolObject(GameObject obj, Vector3 position, Quaternion rotation)
    {
        obj.SetActive(true);
        obj.transform.position = position;
        obj.transform.rotation = rotation;
        
        // Get the pooled object component
        IPooledObject pooledObj = obj.GetComponent<IPooledObject>();
        if (pooledObj != null)
        {
            pooledObj.OnObjectSpawn();
        }
        
        return obj;
    }
    
    public void ReturnToPool(string tag, GameObject obj)
    {
        if (!_poolDictionary.ContainsKey(tag))
        {
            Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
            return;
        }
        
        obj.SetActive(false);
        _poolDictionary[tag].Enqueue(obj);
    }
}

// Interface for pooled objects
public interface IPooledObject
{
    void OnObjectSpawn();
}

// Example implementation
public class Bullet : MonoBehaviour, IPooledObject
{
    [SerializeField] private float _speed = 10f;
    [SerializeField] private float _lifetime = 3f;
    
    private Rigidbody _rigidbody;
    private string _poolTag = "Bullet";
    
    private void Awake()
    {
        _rigidbody = GetComponent<Rigidbody>();
    }
    
    public void OnObjectSpawn()
    {
        _rigidbody.velocity = transform.forward * _speed;
        Invoke(nameof(ReturnToPool), _lifetime);
    }
    
    private void ReturnToPool()
    {
        ObjectPool.Instance.ReturnToPool(_poolTag, gameObject);
    }
    
    private void OnTriggerEnter(Collider other)
    {
        // Handle collision
        ReturnToPool();
    }
}

// Usage
GameObject bullet = ObjectPool.Instance.SpawnFromPool("Bullet", firePoint.position, firePoint.rotation);
```

### 2. Data Structures and Algorithms

```csharp
// Using Dictionaries for fast lookups
public class InventoryManager : MonoBehaviour
{
    // Use dictionary for O(1) lookup time
    private Dictionary<string, Item> _itemsById = new Dictionary<string, Item>();
    
    public void AddItem(Item item)
    {
        if (!_itemsById.ContainsKey(item.Id))
        {
            _itemsById.Add(item.Id, item);
        }
        else
        {
            _itemsById[item.Id].StackCount += item.StackCount;
        }
    }
    
    public Item GetItem(string id)
    {
        if (_itemsById.TryGetValue(id, out Item item))
        {
            return item;
        }
        
        return null;
    }
}

// Spatial partitioning for efficiency
public class SpatialGrid
{
    private float _cellSize;
    private Dictionary<int, List<GameObject>> _grid = new Dictionary<int, List<GameObject>>();
    
    public SpatialGrid(float cellSize)
    {
        _cellSize = cellSize;
    }
    
    public void AddObject(GameObject obj)
    {
        int key = GetKey(obj.transform.position);
        
        if (!_grid.TryGetValue(key, out List<GameObject> cell))
        {
            cell = new List<GameObject>();
            _grid[key] = cell;
        }
        
        cell.Add(obj);
    }
    
    public List<GameObject> GetObjectsNear(Vector3 position, float radius)
    {
        List<GameObject> result = new List<GameObject>();
        int centerKey = GetKey(position);
        int cellRadius = Mathf.CeilToInt(radius / _cellSize);
        
        // Check cells in a square area
        for (int x = -cellRadius; x <= cellRadius; x++)
        {
            for (int z = -cellRadius; z <= cellRadius; z++)
            {
                int key = centerKey + x + z * 1000;  // Simple hash
                
                if (_grid.TryGetValue(key, out List<GameObject> cell))
                {
                    foreach (GameObject obj in cell)
                    {
                        if (Vector3.Distance(position, obj.transform.position) <= radius)
                        {
                            result.Add(obj);
                        }
                    }
                }
            }
        }
        
        return result;
    }
    
    private int GetKey(Vector3 position)
    {
        // Simple 2D grid using integer hash
        int x = Mathf.FloorToInt(position.x / _cellSize);
        int z = Mathf.FloorToInt(position.z / _cellSize);
        return x + z * 1000;  // Simple hash, assumes reasonable world size
    }
}
```

### 3. Optimizing Unity-Specific Operations

```csharp
// Optimize Find and GetComponent calls
public class EnemyManager : MonoBehaviour
{
    // Cache references
    private Transform _player;
    private Dictionary<int, Enemy> _enemiesById = new Dictionary<int, Enemy>();
    
    // Use Awake for initialization
    private void Awake()
    {
        // Find objects once during initialization
        _player = GameObject.FindWithTag("Player").transform;
        
        // Cache all enemies
        foreach (Enemy enemy in FindObjectsOfType<Enemy>())
        {
            _enemiesById.Add(enemy.GetInstanceID(), enemy);
        }
    }
    
    // Avoid GetComponent in Update
    private void Update()
    {
        // Bad:
        // Player player = GameObject.FindWithTag("Player").GetComponent<Player>();
        
        // Good: Use cached reference
        foreach (Enemy enemy in _enemiesById.Values)
        {
            enemy.TrackTarget(_player);
        }
    }
    
    // Register new enemies when spawned
    public void RegisterEnemy(Enemy enemy)
    {
        _enemiesById.Add(enemy.GetInstanceID(), enemy);
    }
    
    // Remove enemies when destroyed
    public void UnregisterEnemy(Enemy enemy)
    {
        _enemiesById.Remove(enemy.GetInstanceID());
    }
}

// Batch operations for better performance
public class ParticleManager : MonoBehaviour
{
    [SerializeField] private ParticleSystem[] _particleSystems;
    
    public void PlayAll()
    {
        // More efficient than individual calls
        foreach (ParticleSystem ps in _particleSystems)
        {
            ps.Play();
        }
    }
    
    public void StopAll()
    {
        foreach (ParticleSystem ps in _particleSystems)
        {
            ps.Stop();
        }
    }
}

// Use proper Update methods
public class CharacterController : MonoBehaviour
{
    // Use Update for input and game logic
    private void Update()
    {
        ProcessInput();
        UpdateUI();
    }
    
    // Use FixedUpdate for physics
    private void FixedUpdate()
    {
        ApplyMovement();
    }
    
    // Use LateUpdate for camera following
    private void LateUpdate()
    {
        UpdateCameraPosition();
    }
    
    // Use coroutines for time-based operations
    private IEnumerator SpawnEnemies()
    {
        while (true)
        {
            SpawnEnemy();
            yield return new WaitForSeconds(5f);
        }
    }
}
```

## Unity-Specific Design Patterns

### 1. ScriptableObject-based Architecture

```csharp
// Weapon data as ScriptableObject
[CreateAssetMenu(fileName = "New Weapon", menuName = "Game/Weapon")]
public class WeaponData : ScriptableObject
{
    public string weaponName;
    public GameObject weaponPrefab;
    public float damage;
    public float fireRate;
    public int ammoCapacity;
    public AudioClip fireSound;
    public ParticleSystem muzzleFlash;
}

// Character data as ScriptableObject
[CreateAssetMenu(fileName = "New Character", menuName = "Game/Character")]
public class CharacterData : ScriptableObject
{
    public string characterName;
    public GameObject characterPrefab;
    public float health;
    public float speed;
    public Sprite portrait;
    public WeaponData startingWeapon;
}

// Weapon behavior that uses the data
public class Weapon : MonoBehaviour
{
    [SerializeField] private WeaponData _weaponData;
    
    private int _currentAmmo;
    private float _nextFireTime;
    
    private AudioSource _audioSource;
    private ParticleSystem _muzzleFlashPS;
    
    private void Awake()
    {
        _currentAmmo = _weaponData.ammoCapacity;
        _audioSource = GetComponent<AudioSource>();
        
        // Instantiate muzzle flash
        if (_weaponData.muzzleFlash != null)
        {
            _muzzleFlashPS = Instantiate(_weaponData.muzzleFlash, transform);
        }
    }
    
    public void Fire()
    {
        if (Time.time < _nextFireTime || _currentAmmo <= 0)
            return;
        
        _nextFireTime = Time.time + 1f / _weaponData.fireRate;
        _currentAmmo--;
        
        // Play effects
        _audioSource.PlayOneShot(_weaponData.fireSound);
        _muzzleFlashPS?.Play();
        
        // Perform raycast or instantiate projectile
        RaycastHit hit;
        if (Physics.Raycast(transform.position, transform.forward, out hit))
        {
            HealthComponent health = hit.collider.GetComponent<HealthComponent>();
            if (health != null)
            {
                health.TakeDamage(_weaponData.damage);
            }
        }
    }
    
    public void Reload()
    {
        _currentAmmo = _weaponData.ammoCapacity;
    }
}
```

### 2. Command Pattern for Input

```csharp
// Command interface
public interface ICommand
{
    void Execute();
    void Undo();
}

// Concrete commands
public class MoveCommand : ICommand
{
    private Transform _transformToMove;
    private Vector3 _moveDirection;
    private float _moveDistance;
    private Vector3 _originalPosition;
    
    public MoveCommand(Transform transformToMove, Vector3 moveDirection, float moveDistance)
    {
        _transformToMove = transformToMove;
        _moveDirection = moveDirection;
        _moveDistance = moveDistance;
    }
    
    public void Execute()
    {
        _originalPosition = _transformToMove.position;
        _transformToMove.Translate(_moveDirection * _moveDistance);
    }
    
    public void Undo()
    {
        _transformToMove.position = _originalPosition;
    }
}

public class AttackCommand : ICommand
{
    private Weapon _weapon;
    
    public AttackCommand(Weapon weapon)
    {
        _weapon = weapon;
    }
    
    public void Execute()
    {
        _weapon.Fire();
    }
    
    public void Undo()
    {
        // Can't undo an attack
    }
}

// Input handler using commands
public class InputHandler : MonoBehaviour
{
    [SerializeField] private Transform _playerTransform;
    [SerializeField] private Weapon _playerWeapon;
    [SerializeField] private float _moveDistance = 1f;
    
    private Stack<ICommand> _commandHistory = new Stack<ICommand>();
    
    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.W))
        {
            ExecuteCommand(new MoveCommand(_playerTransform, Vector3.forward, _moveDistance));
        }
        else if (Input.GetKeyDown(KeyCode.S))
        {
            ExecuteCommand(new MoveCommand(_playerTransform, Vector3.back, _moveDistance));
        }
        else if (Input.GetKeyDown(KeyCode.A))
        {
            ExecuteCommand(new MoveCommand(_playerTransform, Vector3.left, _moveDistance));
        }
        else if (Input.GetKeyDown(KeyCode.D))
        {
            ExecuteCommand(new MoveCommand(_playerTransform, Vector3.right, _moveDistance));
        }
        else if (Input.GetKeyDown(KeyCode.Space))
        {
            ExecuteCommand(new AttackCommand(_playerWeapon));
        }
        else if (Input.GetKeyDown(KeyCode.Z) && Input.GetKey(KeyCode.LeftControl))
        {
            UndoLastCommand();
        }
    }
    
    private void ExecuteCommand(ICommand command)
    {
        command.Execute();
        _commandHistory.Push(command);
    }
    
    private void UndoLastCommand()
    {
        if (_commandHistory.Count > 0)
        {
            ICommand command = _commandHistory.Pop();
            command.Undo();
        }
    }
}
```

### 3. Observer Pattern with UnityEvents

```csharp
// Observable with UnityEvent
public class Health : MonoBehaviour
{
    [SerializeField] private float _maxHealth = 100f;
    private float _currentHealth;
    
    // UnityEvent for health changes
    [System.Serializable]
    public class HealthChangedEvent : UnityEvent<float, float> { }  // current, max
    
    // UnityEvent for death
    [System.Serializable]
    public class DeathEvent : UnityEvent { }
    
    public HealthChangedEvent OnHealthChanged = new HealthChangedEvent();
    public DeathEvent OnDeath = new DeathEvent();
    
    private void Awake()
    {
        _currentHealth = _maxHealth;
    }
    
    public void TakeDamage(float amount)
    {
        _currentHealth = Mathf.Max(0, _currentHealth - amount);
        
        // Notify observers
        OnHealthChanged.Invoke(_currentHealth, _maxHealth);
        
        if (_currentHealth <= 0)
        {
            OnDeath.Invoke();
        }
    }
    
    public void Heal(float amount)
    {
        _currentHealth = Mathf.Min(_maxHealth, _currentHealth + amount);
        
        // Notify observers
        OnHealthChanged.Invoke(_currentHealth, _maxHealth);
    }
}

// Observer (set up in the inspector)
public class HealthUI : MonoBehaviour
{
    [SerializeField] private Slider _healthSlider;
    [SerializeField] private Text _healthText;
    
    // Called by Health.OnHealthChanged event
    public void UpdateHealthUI(float currentHealth, float maxHealth)
    {
        _healthSlider.value = currentHealth / maxHealth;
        _healthText.text = $"{currentHealth}/{maxHealth}";
    }
}

// Observer for death
public class PlayerDeathHandler : MonoBehaviour
{
    [SerializeField] private GameObject _gameOverScreen;
    
    // Called by Health.OnDeath event
    public void HandlePlayerDeath()
    {
        _gameOverScreen.SetActive(true);
        Time.timeScale = 0f; // Pause the game
    }
}
```

## Code Organization and Structure

```csharp
// Namespaces for code organization
namespace MyGame.Combat
{
    public class Weapon : MonoBehaviour
    {
        // Weapon implementation
    }
    
    public class DamageDealer : MonoBehaviour
    {
        // Damage dealer implementation
    }
}

namespace MyGame.UI
{
    public class HealthBar : MonoBehaviour
    {
        // Health bar implementation
    }
    
    public class InventoryUI : MonoBehaviour
    {
        // Inventory UI implementation
    }
}

namespace MyGame.AI
{
    public class EnemyController : MonoBehaviour
    {
        // Enemy AI implementation
    }
    
    public class PathFinder : MonoBehaviour
    {
        // Pathfinding implementation
    }
}

// Editor scripts in Editor namespace
#if UNITY_EDITOR
namespace MyGame.Editor
{
    using UnityEditor;
    
    [CustomEditor(typeof(Weapon))]
    public class WeaponEditor : Editor
    {
        public override void OnInspectorGUI()
        {
            base.OnInspectorGUI();
            
            Weapon weapon = (Weapon)target;
            
            if (GUILayout.Button("Test Fire"))
            {
                weapon.Fire();
            }
        }
    }
}
#endif

// Folder structure recommendation:
// Assets/
// ├── Animations/
// ├── Audio/
// │   ├── Music/
// │   └── SFX/
// ├── Materials/
// ├── Models/
// ├── Prefabs/
// │   ├── Characters/
// │   ├── Environment/
// │   ├── UI/
// │   └── Weapons/
// ├── Resources/
// ├── Scenes/
// ├── ScriptableObjects/
// │   ├── Items/
// │   ├── Characters/
// │   └── Weapons/
// ├── Scripts/
// │   ├── Combat/
// │   ├── Core/
// │   ├── Enemies/
// │   ├── Player/
// │   ├── UI/
// │   └── Utils/
// ├── Settings/
// └── Textures/
``` 