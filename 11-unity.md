# Unity: Best Practices Guide

## Naming Conventions and Standards

### Script and File Naming

```csharp
// Classes and file names should match exactly and use PascalCase
// Example: PlayerController.cs contains the PlayerController class

// Component scripts should be named descriptively and end with their purpose
public class PlayerController : MonoBehaviour  // Not "Player" - too generic
public class EnemySpawner : MonoBehaviour      // Not "Spawn" - unclear
public class UIManager : MonoBehaviour         // Not "Interface" - too broad

// Editor script names should indicate they are editor extensions
public class LevelEditorWindow : EditorWindow     // Editor window
public class TerrainGeneratorEditor : Editor      // Custom inspector

// ScriptableObject asset names should reflect their data type
public class WeaponData : ScriptableObject     // Contains weapon configuration
public class AIBehaviorProfile : ScriptableObject  // Contains AI behavior parameters
```

### Asset Naming Conventions

```
// General pattern: [Type][Subtype]_[Name]_[Variant]

// Prefabs
Enemy_Zombie_Basic
Enemy_Skeleton_Elite
Prop_Tree_Tall
Prop_Rock_Small
UI_Button_Red

// Materials
Mat_Character_Skin
Mat_Environment_Grass
Mat_VFX_Explosion

// Textures
Tex_Character_Albedo
Tex_Environment_Normal
Tex_UI_Button_Diffuse

// Audio
SFX_Weapon_Gunshot
SFX_Ambient_Wind
Music_Level_01_Main

// Animations
Anim_Player_Run
Anim_Enemy_Attack
Anim_UI_ButtonPress
```

### Common Naming Standards for Unity

| Asset Type | Naming Convention | Example |
|------------|-------------------|---------|
| Scripts | PascalCase | `PlayerController.cs` |
| Prefabs | PascalCase_Category | `Player_Warrior.prefab` |
| Materials | Mat_Category_Name | `Mat_Character_Hero.mat` |
| Textures | Tex_Name_Type | `Tex_Brick_Albedo.png` |
| Animations | Anim_Object_Action | `Anim_Character_Run.anim` |
| Audio | SFX/Music_Category_Name | `SFX_Weapon_Reload.wav` |
| Scenes | Scene_Category_Name | `Scene_Level_01.unity` |
| UI | UI_Element_Variant | `UI_Button_Green.prefab` |

## Prefabs: Reuse and Best Practices

### What Are Prefabs and Their Benefits

Prefabs in Unity are reusable templates of complete GameObjects with components and properties. They offer several advantages:

- **Consistency:** Changes to the Prefab are applied to all instances
- **Efficiency:** Reduces duplicate work
- **Organization:** Makes managing repeated elements easier
- **Rapid iteration:** Allows testing changes across multiple objects simultaneously

### Naming Conventions for Prefabs

```
// Recommended pattern for prefab naming:
[Category]_[Subcategory]_[Name]_[Variant]

// Examples by domain:
// Characters
Character_Player_Warrior
Character_Enemy_Zombie_Elite
Character_NPC_Vendor

// Environment
Environment_Vegetation_Tree_Oak
Environment_Building_House_Small
Environment_Decoration_Lamp_Street

// Interface
UI_Panel_Inventory
UI_Button_Red_Large
UI_HUD_HealthBar

// Systems
System_Particles_Fire
System_EnemySpawner_Arena
System_SaveManager
```

### Structure and Organization of Prefabs

To keep prefabs organized:

1. **Group by category:** Group related prefabs in specific folders
   ```
   Prefabs/
   ├── Characters/
   │   ├── Player/
   │   ├── Enemies/
   │   └── NPCs/
   ├── Environment/
   │   ├── Nature/
   │   ├── Buildings/
   │   └── Props/
   ├── UI/
   │   ├── Menus/
   │   ├── HUD/
   │   └── Components/
   └── Systems/
       ├── Particles/
       ├── Managers/
       └── Utilities/
   ```

2. **Nested prefabs:** Break complex prefabs into smaller reusable prefabs
   ```csharp
   // A hierarchical structure for a playable character:
   Player_Main/
   ├── Character_Model/ (nested prefab for visual model)
   ├── Weapon_System/ (nested prefab for managing weapons)
   ├── Health_System/ (nested prefab for managing health and damage)
   └── Inventory_System/ (nested prefab for managing items)
   ```

### Reusing Prefabs

#### Prefab Variants

Variants allow you to create specialized versions of a base prefab while maintaining connection.

```csharp
// Example of a variant structure:

// Base Prefab: Enemy_Base
// - Shared components: EnemyController, Health, NavMeshAgent

// Variants:
// 1. Enemy_Zombie_Normal (inherits from Enemy_Base)
//    - Specific adjustments: slower speed, lower damage
// 2. Enemy_Zombie_Elite (inherits from Enemy_Base)
//    - Specific adjustments: faster speed, higher damage, additional visual effects
```

To create variants:
1. Select the base prefab in the Project Window
2. Right-click and select "Create > Prefab Variant"
3. Modify the variant as needed

#### Nested Prefabs

Nested prefabs allow you to compose more complex prefabs from other prefabs:

```csharp
// Example: A reusable weapon system

// 1. Prefab: Weapon_Base
//    - Components: WeaponController, MuzzleEffects, RecoilSystem

// 2. Prefab: Character_Player
//    - Contains a reference to the Weapon_Base prefab in its hierarchy
//    - Connects through scripts: WeaponManager

// Benefits:
// - Changes to Weapon_Base reflect across all characters using it
// - Different characters can use variants of the same base weapon
// - Makes it easier to create new weapons by inheritance
```

### Best Practices for Prefabs

1. **Self-documenting prefabs:**
   ```csharp
   // Add empty objects with descriptive names as organizers
   Character_Player/
   ├── _References/ (empty object grouping references)
   ├── _Systems/ (empty object grouping systems)
   └── _VisualModel/ (empty object grouping visual elements)
   ```

2. **Robust prefabs with cached GetComponent:**
   ```csharp
   public class PrefabComponent : MonoBehaviour
   {
       // Reference critical components using SerializeField
       // to ensure they are present
       [SerializeField] private Animator _animator;
       
       // Cache other components in Awake
       private Rigidbody _rigidbody;
       
       private void Awake()
       {
           // Check critical components
           if (_animator == null)
           {
               Debug.LogError($"Animator not assigned on {gameObject.name}", this);
           }
           
           // Cache other components
           _rigidbody = GetComponent<Rigidbody>();
       }
   }
   ```

3. **Contextual prefabs with scriptable objects:**
   ```csharp
   // Define data in ScriptableObjects
   [CreateAssetMenu(fileName = "NewEnemyConfig", menuName = "Game/Enemy Config")]
   public class EnemyConfiguration : ScriptableObject
   {
       public float moveSpeed = 3.5f;
       public float maxHealth = 100f;
       public float damage = 10f;
   }
   
   // Use in prefab
   public class EnemyController : MonoBehaviour
   {
       [SerializeField] private EnemyConfiguration _config;
       
       private void Start()
       {
           // Initialize using configuration
           GetComponent<NavMeshAgent>().speed = _config.moveSpeed;
       }
   }
   ```

4. **Property override conventions:**
   ```
   // Use the visual convention in the Inspector:
   // - Bold text: prefab original value
   // - Normal text: component default value
   // - Bold blue text: value overridden in instance
   ```

5. **Strategies for mass updates:**
   ```csharp
   // 1. Maintain a central reference for main prefabs:
   [CreateAssetMenu(fileName = "PrefabRegistry", menuName = "Game/System/Prefab Registry")]
   public class PrefabRegistry : ScriptableObject
   {
       public GameObject playerPrefab;
       public GameObject defaultEnemyPrefab;
       public GameObject[] commonItemPrefabs;
   }
   
   // 2. Access via script:
   public class ItemSpawner : MonoBehaviour
   {
       [SerializeField] private PrefabRegistry _registry;
       
       public void SpawnRandomItem(Vector3 position)
       {
           int index = Random.Range(0, _registry.commonItemPrefabs.Length);
           Instantiate(_registry.commonItemPrefabs[index], position, Quaternion.identity);
       }
   }
   ```

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
```

## Project Structure and Organization

### Folder Structure Best Practices

```
Assets/
├── _Project                  // Core project-specific assets
│   ├── Art                   // All visual assets
│   │   ├── Animations
│   │   ├── Materials
│   │   ├── Models
│   │   ├── Textures
│   │   └── UI
│   ├── Audio                 // All audio assets
│   │   ├── Music
│   │   ├── SFX
│   │   └── Ambient
│   ├── Scripts               // All scripts
│   │   ├── Editor            // Editor tools and extensions
│   │   ├── Core              // Essential systems
│   │   ├── Gameplay          // Game mechanics
│   │   ├── UI                // User interface
│   │   └── Utils             // Utility functions
│   │   └── Tests             // Test scripts
│   ├── Data                  // ScriptableObjects and data assets
│   │   ├── Items
│   │   ├── Characters
│   │   └── Levels
│   ├── Prefabs               // Reusable GameObject templates
│   │   ├── Characters
│   │   ├── Environment
│   │   ├── Systems
│   │   └── UI
│   ├── Scenes                // All game scenes
│   │   ├── Levels
│   │   ├── MainMenu
│   │   └── System
│   └── Settings              // Project configuration
│       ├── Input
│       ├── Rendering
│       └── Audio
├── Plugins                   // Third-party assets and plugins
│   ├── PackageName1
│   └── PackageName2
└── Resources                 // Assets loaded at runtime (use sparingly)
```

### Assembly Organization

Using Assembly Definition files (.asmdef) provides significant benefits:
- Faster compilation times
- Better dependency management
- Enhanced code organization
- Cleaner testing setup

```
// Recommended assembly structure
Assets/
├── _Project
│   ├── Code
│   │   ├── Editor
│   │   │   └── MyGame.Editor.asmdef          // Editor tools
│   │   ├── Runtime
│   │   │   ├── MyGame.Core.asmdef            // Core systems
│   │   │   ├── MyGame.Gameplay.asmdef        // Gameplay systems
│   │   │   └── MyGame.UI.asmdef              // UI systems
│   │   └── Tests
│   │       ├── MyGame.Tests.EditMode.asmdef  // Edit mode tests
│   │       └── MyGame.Tests.PlayMode.asmdef  // Play mode tests
```

### Project Settings Recommendations

Key settings to standardize across the team:
- **Version Control:**
  - Set mode to "Visible Meta Files"
  - Asset Serialization to "Force Text"
  - Enable Git LFS for large binary files
- **Editor Preferences:**
  - Enable "Auto Refresh"
  - Set script reloading to suit project size
- **Quality Settings:**
  - Define quality presets for different platforms
- **Player Settings:**
  - Configure company/product information
  - Set default API compatibility level
  - Configure graphics/input/debugging settings
- **Physics Settings:**
  - Configure layer collision matrix
  - Set fixed timestep to 0.02 (50Hz) for consistency

## Extended Design Patterns

### 1. Model-View-Controller (MVC)

```csharp
// Model: contains data and business logic
public class PlayerModel
{
    public float Health { get; private set; }
    public float MaxHealth { get; private set; }
    public int Score { get; private set; }
    
    public event Action<float> OnHealthChanged;
    public event Action<int> OnScoreChanged;
    
    public PlayerModel(float maxHealth)
    {
        MaxHealth = maxHealth;
        Health = maxHealth;
        Score = 0;
    }
    
    public void TakeDamage(float amount)
    {
        Health = Mathf.Max(0, Health - amount);
        OnHealthChanged?.Invoke(Health);
    }
    
    public void AddScore(int points)
    {
        Score += points;
        OnScoreChanged?.Invoke(Score);
    }
}

// View: handles visual representation
public class PlayerView : MonoBehaviour
{
    [SerializeField] private Animator _animator;
    [SerializeField] private ParticleSystem _damageVFX;
    
    public void UpdateHealthVisuals(float currentHealth, float maxHealth)
    {
        float healthPercentage = currentHealth / maxHealth;
        
        // Update visual state based on health
        if (healthPercentage < 0.3f)
        {
            _animator.SetBool("IsCritical", true);
        }
        else
        {
            _animator.SetBool("IsCritical", false);
        }
    }
    
    public void PlayDamageEffect()
    {
        _damageVFX.Play();
    }
}

// Controller: connects model and view, handles input
public class PlayerController : MonoBehaviour
{
    [SerializeField] private PlayerView _view;
    
    private PlayerModel _model;
    
    private void Awake()
    {
        _model = new PlayerModel(100f);
        
        // Subscribe to model events
        _model.OnHealthChanged += HandleHealthChanged;
    }
    
    private void OnDestroy()
    {
        // Unsubscribe from model events
        _model.OnHealthChanged -= HandleHealthChanged;
    }
    
    public void HandleDamage(float amount)
    {
        _model.TakeDamage(amount);
        _view.PlayDamageEffect();
    }
    
    private void HandleHealthChanged(float newHealth)
    {
        _view.UpdateHealthVisuals(newHealth, _model.MaxHealth);
    }
}
```

### 2. Dependency Injection

```csharp
// Service interfaces
public interface IDataService
{
    T LoadData<T>(string key);
    void SaveData<T>(string key, T data);
}

public interface IAudioService
{
    void PlaySound(AudioClip clip, float volume = 1.0f);
    void PlayMusic(AudioClip music, bool loop = true);
}

// Service implementations
public class PlayerPrefsDataService : IDataService
{
    public T LoadData<T>(string key)
    {
        // Implementation using PlayerPrefs
        string json = PlayerPrefs.GetString(key, string.Empty);
        return string.IsNullOrEmpty(json) ? default : JsonUtility.FromJson<T>(json);
    }
    
    public void SaveData<T>(string key, T data)
    {
        string json = JsonUtility.ToJson(data);
        PlayerPrefs.SetString(key, json);
        PlayerPrefs.Save();
    }
}

public class UnityAudioService : IAudioService
{
    private AudioSource _musicSource;
    private AudioSource _sfxSource;
    
    public UnityAudioService(AudioSource musicSource, AudioSource sfxSource)
    {
        _musicSource = musicSource;
        _sfxSource = sfxSource;
    }
    
    public void PlaySound(AudioClip clip, float volume = 1.0f)
    {
        _sfxSource.PlayOneShot(clip, volume);
    }
    
    public void PlayMusic(AudioClip music, bool loop = true)
    {
        _musicSource.clip = music;
        _musicSource.loop = loop;
        _musicSource.Play();
    }
}

// Service locator pattern
public class ServiceLocator
{
    private static ServiceLocator _instance;
    
    public static ServiceLocator Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new ServiceLocator();
            }
            return _instance;
        }
    }
    
    private Dictionary<Type, object> _services = new Dictionary<Type, object>();
    
    public void RegisterService<T>(T service)
    {
        _services[typeof(T)] = service;
    }
    
    public T GetService<T>()
    {
        if (_services.TryGetValue(typeof(T), out object service))
        {
            return (T)service;
        }
        
        Debug.LogError($"Service {typeof(T).Name} not found!");
        return default;
    }
}

// Service setup example
public class ServiceInitializer : MonoBehaviour
{
    [SerializeField] private AudioSource _musicSource;
    [SerializeField] private AudioSource _sfxSource;
    
    private void Awake()
    {
        // Register services
        ServiceLocator.Instance.RegisterService<IDataService>(new PlayerPrefsDataService());
        ServiceLocator.Instance.RegisterService<IAudioService>(new UnityAudioService(_musicSource, _sfxSource));
    }
}

// Service consumer example
public class GameManager : MonoBehaviour
{
    private IAudioService _audioService;
    private IDataService _dataService;
    
    private void Start()
    {
        // Retrieve services
        _audioService = ServiceLocator.Instance.GetService<IAudioService>();
        _dataService = ServiceLocator.Instance.GetService<IDataService>();
        
        // Use services
        GameData savedGame = _dataService.LoadData<GameData>("SavedGame");
        if (savedGame != null)
        {
            LoadGame(savedGame);
            _audioService.PlayMusic(gameTheme);
        }
    }
}
```

### 3. Data-Driven Design with Addressables

```csharp
// Item definition using ScriptableObject
[CreateAssetMenu(fileName = "New Item", menuName = "Game/Item")]
public class ItemData : ScriptableObject
{
    public string itemId;
    public string displayName;
    public Sprite icon;
    public string addressablePrefabKey;
    public ItemType type;
    public List<ItemEffect> effects;
    
    [System.Serializable]
    public class ItemEffect
    {
        public EffectType type;
        public float value;
    }
    
    public enum ItemType { Weapon, Armor, Consumable, Quest }
    public enum EffectType { Damage, Healing, Defense, SpeedBoost }
}

// Item loading with Addressables
public class ItemManager : MonoBehaviour
{
    [SerializeField] private List<ItemData> _availableItems;
    
    private Dictionary<string, ItemData> _itemsById = new Dictionary<string, ItemData>();
    
    private void Awake()
    {
        foreach (ItemData item in _availableItems)
        {
            _itemsById[item.itemId] = item;
        }
    }
    
    public async Task<GameObject> SpawnItemInWorld(string itemId, Vector3 position)
    {
        if (!_itemsById.TryGetValue(itemId, out ItemData itemData))
        {
            Debug.LogError($"Item with ID {itemId} not found");
            return null;
        }
        
        // Load item prefab using Addressables
        GameObject itemPrefab = await Addressables.LoadAssetAsync<GameObject>(itemData.addressablePrefabKey).Task;
        
        // Instantiate the item
        GameObject itemInstance = Instantiate(itemPrefab, position, Quaternion.identity);
        
        // Configure the item
        WorldItem worldItem = itemInstance.GetComponent<WorldItem>();
        worldItem.Initialize(itemData);
        
        return itemInstance;
    }
}
```

## Advanced Unity Editor Tools

### Custom Editor Utilities

```csharp
#if UNITY_EDITOR
using UnityEditor;

// Custom property drawer
[CustomPropertyDrawer(typeof(RangedFloat))]
public class RangedFloatDrawer : PropertyDrawer
{
    public override void OnGUI(Rect position, SerializedProperty property, GUIContent label)
    {
        EditorGUI.BeginProperty(position, label, property);
        
        // Get property references
        SerializedProperty minProp = property.FindPropertyRelative("min");
        SerializedProperty maxProp = property.FindPropertyRelative("max");
        
        // Calculate rects
        float labelWidth = EditorGUIUtility.labelWidth;
        Rect labelRect = new Rect(position.x, position.y, labelWidth, position.height);
        Rect sliderRect = new Rect(position.x + labelWidth, position.y, position.width - labelWidth, position.height);
        
        // Draw label
        EditorGUI.LabelField(labelRect, label);
        
        // Store values
        float minValue = minProp.floatValue;
        float maxValue = maxProp.floatValue;
        
        // Draw min-max slider
        EditorGUI.MinMaxSlider(sliderRect, ref minValue, ref maxValue, 0f, 1f);
        
        // Update properties
        minProp.floatValue = minValue;
        maxProp.floatValue = maxValue;
        
        EditorGUI.EndProperty();
    }
}

// Custom editor window
public class AssetCreatorWindow : EditorWindow
{
    private string _assetName = "New Asset";
    private AssetType _assetType = AssetType.Weapon;
    
    private enum AssetType { Weapon, Character, Item }
    
    [MenuItem("Tools/Asset Creator")]
    public static void ShowWindow()
    {
        GetWindow<AssetCreatorWindow>("Asset Creator");
    }
    
    private void OnGUI()
    {
        GUILayout.Label("Create Game Assets", EditorStyles.boldLabel);
        
        _assetName = EditorGUILayout.TextField("Asset Name", _assetName);
        _assetType = (AssetType)EditorGUILayout.EnumPopup("Asset Type", _assetType);
        
        if (GUILayout.Button("Create Asset"))
        {
            CreateAsset();
        }
    }
    
    private void CreateAsset()
    {
        switch (_assetType)
        {
            case AssetType.Weapon:
                CreateWeapon();
                break;
            case AssetType.Character:
                CreateCharacter();
                break;
            case AssetType.Item:
                CreateItem();
                break;
        }
    }
    
    private void CreateWeapon()
    {
        // Create weapon ScriptableObject
        WeaponData asset = ScriptableObject.CreateInstance<WeaponData>();
        
        // Configure asset
        asset.weaponName = _assetName;
        
        // Create asset file
        string path = EditorUtility.SaveFilePanelInProject(
            "Save Weapon Data",
            _assetName,
            "asset",
            "Choose location to save weapon data"
        );
        
        if (!string.IsNullOrEmpty(path))
        {
            AssetDatabase.CreateAsset(asset, path);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            
            // Select the asset in the Project window
            Selection.activeObject = asset;
        }
    }
    
    // Implement other creation methods...
}
#endif
```

### Automated Testing

```csharp
// Edit mode test example
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

public class HealthSystemTests
{
    [Test]
    public void HealthSystem_TakeDamage_ReducesHealth()
    {
        // Arrange
        HealthComponent healthComponent = new GameObject().AddComponent<HealthComponent>();
        float initialHealth = healthComponent.CurrentHealth;
        float damageAmount = 25f;
        
        // Act
        healthComponent.TakeDamage(damageAmount);
        
        // Assert
        Assert.AreEqual(initialHealth - damageAmount, healthComponent.CurrentHealth);
    }
    
    [Test]
    public void HealthSystem_TakeDamage_CannotGoBelowZero()
    {
        // Arrange
        HealthComponent healthComponent = new GameObject().AddComponent<HealthComponent>();
        float largeDamage = healthComponent.MaxHealth * 2;
        
        // Act
        healthComponent.TakeDamage(largeDamage);
        
        // Assert
        Assert.AreEqual(0, healthComponent.CurrentHealth);
    }
    
    [Test]
    public void HealthSystem_Heal_IncreasesHealth()
    {
        // Arrange
        HealthComponent healthComponent = new GameObject().AddComponent<HealthComponent>();
        healthComponent.TakeDamage(50f); // Reduce health first
        float beforeHeal = healthComponent.CurrentHealth;
        float healAmount = 20f;
        
        // Act
        healthComponent.Heal(healAmount);
        
        // Assert
        Assert.AreEqual(beforeHeal + healAmount, healthComponent.CurrentHealth);
    }
    
    [Test]
    public void HealthSystem_Heal_CannotExceedMaxHealth()
    {
        // Arrange
        HealthComponent healthComponent = new GameObject().AddComponent<HealthComponent>();
        float maxHealth = healthComponent.MaxHealth;
        
        // Act
        healthComponent.Heal(maxHealth * 2);
        
        // Assert
        Assert.AreEqual(maxHealth, healthComponent.CurrentHealth);
    }
}

// Play mode test example
public class PlayerMovementTests : MonoBehaviour
{
    private PlayerController _player;
    
    [SetUp]
    public void Setup()
    {
        // Load player prefab and instantiate it
        GameObject playerPrefab = Resources.Load<GameObject>("Prefabs/Player");
        GameObject playerInstance = Object.Instantiate(playerPrefab);
        _player = playerInstance.GetComponent<PlayerController>();
    }
    
    [UnityTest]
    public IEnumerator Player_Move_ChangesPosition()
    {
        // Arrange
        Vector3 startPosition = _player.transform.position;
        Vector3 moveDirection = Vector3.forward;
        
        // Act
        _player.Move(moveDirection);
        
        // Wait a frame for physics to update
        yield return null;
        
        // Assert
        Assert.AreNotEqual(startPosition, _player.transform.position);
    }
    
    [TearDown]
    public void Teardown()
    {
        Object.Destroy(_player.gameObject);
    }
}
```

## Performance Optimization

### Memory Management

```csharp
// Avoid allocations in performance-critical code
public class OptimizedEnemySpawner : MonoBehaviour
{
    [SerializeField] private Transform[] _spawnPoints;
    [SerializeField] private GameObject _enemyPrefab;
    [SerializeField] private int _maxEnemies = 20;
    
    // Pre-allocate lists and arrays
    private List<GameObject> _activeEnemies;
    private Vector3[] _cachedPositions;
    private StringBuilder _debugStringBuilder = new StringBuilder();
    
    private void Awake()
    {
        // Allocate collections once
        _activeEnemies = new List<GameObject>(_maxEnemies);
        _cachedPositions = new Vector3[_spawnPoints.Length];
        
        // Cache spawn point positions
        for (int i = 0; i < _spawnPoints.Length; i++)
        {
            _cachedPositions[i] = _spawnPoints[i].position;
        }
    }
    
    // Use object pooling for frequent instantiation/destruction
    private void SpawnEnemy()
    {
        if (_activeEnemies.Count >= _maxEnemies)
            return;
        
        // Use ObjectPool instead of Instantiate
        GameObject enemy = ObjectPool.Instance.SpawnFromPool("Enemy", 
            _cachedPositions[Random.Range(0, _cachedPositions.Length)], 
            Quaternion.identity);
            
        _activeEnemies.Add(enemy);
    }
    
    // Avoid string concatenation in Update
    private void Update()
    {
        // Bad:
        // Debug.Log("Active enemies: " + _activeEnemies.Count + "/" + _maxEnemies);
        
        // Good:
        if (needsToLog)
        {
            _debugStringBuilder.Clear();
            _debugStringBuilder.Append("Active enemies: ");
            _debugStringBuilder.Append(_activeEnemies.Count);
            _debugStringBuilder.Append("/");
            _debugStringBuilder.Append(_maxEnemies);
            
            Debug.Log(_debugStringBuilder.ToString());
        }
    }
    
    // Clean up properly
    private void OnDestroy()
    {
        _activeEnemies.Clear();
    }
}
```

### Unity Profiling Tips

```csharp
// Use ProfilerMarkers for advanced profiling
private static readonly ProfilerMarker s_PathfindingMarker = 
    new ProfilerMarker("AI.Pathfinding");

public void CalculatePath(Vector3 start, Vector3 end)
{
    // Begin profiling section
    s_PathfindingMarker.Begin();
    
    try
    {
        // Expensive pathfinding logic here...
    }
    finally
    {
        // Always end marker, even if exceptions occur
        s_PathfindingMarker.End();
    }
}

// Detect performance issues early
public class PerformanceWatcher : MonoBehaviour
{
    [SerializeField] private float _warningThresholdMs = 16.7f; // 60fps threshold
    [SerializeField] private bool _logToConsole = true;
    
    private float _lastFrameTime;
    
    private void Update()
    {
        float currentFrameTime = Time.unscaledDeltaTime * 1000f;
        
        if (currentFrameTime > _warningThresholdMs)
        {
            float frameRate = 1.0f / Time.unscaledDeltaTime;
            
            if (_logToConsole)
            {
                Debug.LogWarning($"Frame time: {currentFrameTime:F2}ms ({frameRate:F1} FPS) - Performance drop detected");
            }
        }
        
        _lastFrameTime = currentFrameTime;
    }
}
```

## Code Organization and Structure

// ... existing code ...

## Workflow Automations

```csharp
#if UNITY_EDITOR
// Build pipeline automation
public class BuildAutomator
{
    [MenuItem("Build/Build All Platforms")]
    public static void BuildAllPlatforms()
    {
        // iOS build
        BuildPlayerOptions iosOptions = new BuildPlayerOptions
        {
            scenes = GetEnabledScenes(),
            locationPathName = "Builds/iOS",
            target = BuildTarget.iOS,
            options = BuildOptions.None
        };
        
        BuildPipeline.BuildPlayer(iosOptions);
        
        // Android build
        BuildPlayerOptions androidOptions = new BuildPlayerOptions
        {
            scenes = GetEnabledScenes(),
            locationPathName = "Builds/Android/game.apk",
            target = BuildTarget.Android,
            options = BuildOptions.None
        };
        
        BuildPipeline.BuildPlayer(androidOptions);
    }
    
    private static string[] GetEnabledScenes()
    {
        return EditorBuildSettings.scenes
            .Where(scene => scene.enabled)
            .Select(scene => scene.path)
            .ToArray();
    }
}

// Version incrementor
public class VersionIncrementor
{
    [MenuItem("Tools/Increment Build Number")]
    public static void IncrementBuildNumber()
    {
        // Get current version
        string version = PlayerSettings.bundleVersion;
        string[] versionParts = version.Split('.');
        
        if (versionParts.Length >= 3)
        {
            // Increment build number
            int buildNumber = int.Parse(versionParts[2]);
            buildNumber++;
            
            // Update version
            versionParts[2] = buildNumber.ToString();
            string newVersion = string.Join(".", versionParts);
            
            PlayerSettings.bundleVersion = newVersion;
            Debug.Log($"Version incremented to {newVersion}");
        }
    }
}
#endif
``` 