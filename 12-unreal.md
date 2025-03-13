# Unreal Engine: Best Practices Guide

## C++ Coding Standards

```cpp
// Use proper naming conventions
class MYGAME_API AMyGameCharacter : public ACharacter // Classes with A prefix for Actors
{
    GENERATED_BODY() // Always include the GENERATED_BODY macro
    
public:
    // Constructor
    AMyGameCharacter();
    
    // Override functions use the override keyword
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    
    // Use UPROPERTY to expose to Blueprint with proper category
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Character")
    float MovementSpeed = 600.0f;
    
    // Use VisibleAnywhere for components created in C++
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    USpringArmComponent* CameraBoom;
    
    // Use UFUNCTION for Blueprint exposure
    UFUNCTION(BlueprintCallable, Category = "Character")
    void ApplyDamage(float DamageAmount);
    
    // Blueprint implementable events
    UFUNCTION(BlueprintImplementableEvent, Category = "Character")
    void OnDamageReceived(float DamageAmount);
    
    // Blueprint native events (C++ base with optional Blueprint override)
    UFUNCTION(BlueprintNativeEvent, Category = "Character")
    void OnHealthChanged(float NewHealth);
    void OnHealthChanged_Implementation(float NewHealth);
    
private:
    // Private variables use m prefix
    float mHealth = 100.0f;
    
    // Private function with clear name
    void UpdateCharacterStatus();
};
```

## Clear Conditional Logic in Unreal

```cpp
// Bad - complex condition directly in if statement
if (Character->GetHealth() > 0 && !Character->IsStunned() && 
    Character->GetStamina() > 10 && !UGameplayStatics::IsGamePaused(GetWorld()) && 
    Controller && Controller->IsInputKeyDown(EKeys::LeftMouseButton))
{
    ExecuteAttack();
}

// Good - using descriptive variables to explain the conditions
bool bIsAlive = Character->GetHealth() > 0;
bool bIsNotStunned = !Character->IsStunned();
bool bHasEnoughStamina = Character->GetStamina() > 10;
bool bIsGameActive = !UGameplayStatics::IsGamePaused(GetWorld());
bool bIsAttackButtonPressed = Controller && Controller->IsInputKeyDown(EKeys::LeftMouseButton);

bool bCanExecuteAttack = bIsAlive && bIsNotStunned && bHasEnoughStamina && bIsGameActive;

if (bCanExecuteAttack && bIsAttackButtonPressed)
{
    ExecuteAttack();
}

// Even better - wrap complex conditions in functions with descriptive names
bool CanCharacterAttack() const
{
    bool bIsAlive = Character->GetHealth() > 0;
    bool bIsNotStunned = !Character->IsStunned();
    bool bHasEnoughStamina = Character->GetStamina() > 10;
    bool bIsGameActive = !UGameplayStatics::IsGamePaused(GetWorld());
    
    return bIsAlive && bIsNotStunned && bHasEnoughStamina && bIsGameActive;
}

void Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    
    if (CanCharacterAttack() && Controller && Controller->IsInputKeyDown(EKeys::LeftMouseButton))
    {
        ExecuteAttack();
    }
}

// Using constants for game design values
// Bad - magic numbers
if (FVector::Dist(GetActorLocation(), TargetLocation) < 300.0f)
{
    ActivatePickup();
}

// Good - named constants
const float PICKUP_RANGE = 300.0f;

if (FVector::Dist(GetActorLocation(), TargetLocation) < PICKUP_RANGE)
{
    ActivatePickup();
}

// Better - use configuration values
// In header:
UPROPERTY(EditDefaultsOnly, Category = "Interaction")
float PickupRange = 300.0f;

// In implementation:
if (FVector::Dist(GetActorLocation(), TargetLocation) < PickupRange)
{
    ActivatePickup();
}
```

## Blueprint Best Practices

### 1. Blueprint Organization

1. **Comment Your Blueprints**
   - Add comments to groups of nodes explaining their purpose
   - Use comment boxes to organize logical sections

2. **Use Functions and Macros**
   - Break complex logic into functions
   - Create reusable macros for repeated patterns
   - Organize by functionality

3. **Blueprint Communication**
   - Prefer event dispatchers over direct references
   - Use interfaces for cross-blueprint communication
   - Implement gameplay tags for flexible interactions

### 2. Blueprint Efficiency

1. **Minimize Event Tick Usage**
   - Avoid heavy computation in Event Tick
   - Use timers or custom tick functions with longer intervals when possible

2. **Array Operations**
   - Minimize "Get" operations inside loops
   - Use "for each loop with break" for early exit conditions

3. **Variable Usage**
   - Cache frequently accessed values
   - Use local variables for calculations
   - Set appropriate variable scope (instance vs. local)

### 3. Clear Blueprint Logic with Variables

1. **Create descriptive variables for conditions**
   - Create boolean variables with descriptive names for complex conditions
   - Combine conditions using AND/OR operations for readability
   - Use Branch nodes with clear variable names

2. **Blueprint function example for clean conditionals**
   ```
   Function: CanCharacterAttack
   Input: None
   Output: Boolean
   
   Steps:
   1. Create local boolean: IsAlive = Health > 0
   2. Create local boolean: IsNotStunned = NOT IsStunned
   3. Create local boolean: HasEnoughStamina = Stamina > 10
   4. Create local boolean: IsGameActive = NOT IsGamePaused
   5. Return: IsAlive AND IsNotStunned AND HasEnoughStamina AND IsGameActive
   ```

## Component-Based Design

```cpp
// Character with component-based design
UCLASS()
class MYGAME_API AModularCharacter : public ACharacter
{
    GENERATED_BODY()
    
public:
    AModularCharacter();
    
    // Health component
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    UHealthComponent* HealthComponent;
    
    // Inventory component
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    UInventoryComponent* InventoryComponent;
    
    // Ability component
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    UAbilityComponent* AbilityComponent;
    
    // Instead of implementing all functionality in the character class,
    // delegate to specialized components
};

// Health component implementation
UCLASS()
class MYGAME_API UHealthComponent : public UActorComponent
{
    GENERATED_BODY()
    
public:
    UHealthComponent();
    
    virtual void BeginPlay() override;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Health")
    float MaxHealth = 100.0f;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Health")
    float CurrentHealth = 100.0f;
    
    UFUNCTION(BlueprintCallable, Category = "Health")
    void ApplyDamage(float DamageAmount, AActor* DamageCauser);
    
    UFUNCTION(BlueprintCallable, Category = "Health")
    void Heal(float HealAmount);
    
    // Delegates for event broadcasting
    DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnHealthChangedSignature, float, CurrentHealth, float, MaxHealth);
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnHealthChangedSignature OnHealthChanged;
    
    DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDeathSignature, AActor*, Killer);
    UPROPERTY(BlueprintAssignable, Category = "Events")
    FOnDeathSignature OnDeath;
    
protected:
    void BroadcastHealthChange();
};
```

## Data-Driven Design with Data Assets

```cpp
// Item data asset
UCLASS()
class MYGAME_API UItemData : public UPrimaryDataAsset
{
    GENERATED_BODY()
    
public:
    // Basic item properties
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    FName ItemID;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    FText ItemName;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    FText Description;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    UTexture2D* Icon;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    int32 MaxStackSize = 1;
    
    // Item function - virtual so specific item types can override
    UFUNCTION(BlueprintCallable, Category = "Item")
    virtual bool Use(AActor* User);
    
    // Asset identification
    virtual FPrimaryAssetId GetPrimaryAssetId() const override
    {
        return FPrimaryAssetId("Item", ItemID);
    }
};

// Specific item type (weapon)
UCLASS()
class MYGAME_API UWeaponData : public UItemData
{
    GENERATED_BODY()
    
public:
    // Weapon-specific properties
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
    float BaseDamage = 10.0f;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
    float AttackSpeed = 1.0f;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Weapon")
    TSubclassOf<AActor> WeaponActorClass;
    
    // Override the Use function for weapons
    virtual bool Use(AActor* User) override;
};
```

## Optimization Tips

```cpp
// Optimize Blueprint heavy operations with C++
// Expose a C++ function to Blueprint for better performance

// In header:
UFUNCTION(BlueprintCallable, Category = "Optimization")
TArray<AActor*> FindNearbyActors(TSubclassOf<AActor> ActorClass, float SearchRadius);

// In implementation:
TArray<AActor*> AMyGameActor::FindNearbyActors(TSubclassOf<AActor> ActorClass, float SearchRadius)
{
    TArray<AActor*> Result;
    
    // Use spatial data structure for efficiency
    UWorld* World = GetWorld();
    if (!World)
        return Result;
    
    // Use efficient query
    TArray<FOverlapResult> Overlaps;
    FCollisionQueryParams QueryParams;
    QueryParams.AddIgnoredActor(this);
    
    // Sphere overlap query
    const FCollisionShape SphereShape = FCollisionShape::MakeSphere(SearchRadius);
    World->OverlapMultiByObjectType(
        Overlaps,
        GetActorLocation(),
        FQuat::Identity,
        FCollisionObjectQueryParams(ECC_WorldDynamic),
        SphereShape,
        QueryParams
    );
    
    // Filter by class
    for (const FOverlapResult& Overlap : Overlaps)
    {
        if (AActor* Actor = Overlap.GetActor())
        {
            if (Actor->IsA(ActorClass))
            {
                Result.Add(Actor);
            }
        }
    }
    
    return Result;
}

// Memory-efficient actor implementation
UCLASS()
class MYGAME_API AOptimizedActor : public AActor
{
    GENERATED_BODY()
    
public:
    AOptimizedActor();
    
    // Use object pooling for spawnable actors
    static AOptimizedActor* SpawnFromPool(UWorld* World, TSubclassOf<AOptimizedActor> ActorClass, const FTransform& Transform);
    void ReturnToPool();
    
    // Override Tick to disable when not needed
    virtual void Tick(float DeltaTime) override;
    
    // Use instanced static meshes for repeated elements
    UPROPERTY(VisibleAnywhere, Category = "Rendering")
    UInstancedStaticMeshComponent* InstancedMesh;
};

// CPU Profiling with stats
void APerformanceCriticalActor::ExecuteExpensiveOperation()
{
    // Add stats for profiling
    SCOPE_CYCLE_COUNTER(STAT_ExpensiveOperation);
    
    // Your code here
}
```

## Blueprint and C++ Integration

```cpp
// Blueprint Function Library for utility functions
UCLASS()
class MYGAME_API UMyBlueprintFunctionLibrary : public UBlueprintFunctionLibrary
{
    GENERATED_BODY()
    
public:
    // Math utilities
    UFUNCTION(BlueprintCallable, Category = "Math")
    static float CalculateTrajectoryAngle(FVector Start, FVector End, float LaunchSpeed, bool bHighArc);
    
    // String utilities
    UFUNCTION(BlueprintPure, Category = "Text")
    static FText FormatTimeText(float TotalSeconds);
    
    // Game utilities
    UFUNCTION(BlueprintCallable, Category = "Game")
    static void GetPlayersInRadius(UObject* WorldContextObject, FVector Center, float Radius, TArray<AActor*>& OutActors);
};

// Blueprint extendable functionality
UCLASS(Blueprintable)
class MYGAME_API AExtendableActor : public AActor
{
    GENERATED_BODY()
    
public:
    AExtendableActor();
    
    // Override in Blueprint
    UFUNCTION(BlueprintNativeEvent, Category = "Interaction")
    void Interact(AActor* Interactor);
    virtual void Interact_Implementation(AActor* Interactor);
    
    // Override in Blueprint
    UFUNCTION(BlueprintNativeEvent, Category = "Events")
    void OnActivated();
    virtual void OnActivated_Implementation();
    
    // Must be implemented in Blueprint
    UFUNCTION(BlueprintImplementableEvent, Category = "Events")
    void OnCustomEvent(const FString& EventName);
};
```

## Project Organization Best Practices

1. **Content Organization**
   - Group content by type and purpose
   - Use consistent naming conventions
   - Create dedicated folders for core systems

2. **Blueprint Structure**
   - Use parent classes to share common functionality
   - Create Blueprint interfaces for polymorphic behavior
   - Use Blueprint Function Libraries for utility functions

3. **C++ and Blueprint Integration**
   - Implement performance-critical code in C++
   - Expose configuration to Blueprint
   - Use appropriate UPROPERTY and UFUNCTION specifiers

4. **Documentation**
   - Comment complex C++ code and Blueprint graphs
   - Add tooltips to exposed properties
   - Maintain up-to-date design documents
``` 