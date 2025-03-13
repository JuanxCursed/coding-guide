# Godot Engine and GDScript: Best Practices Guide

## GDScript Style Guidelines

```gdscript
# Use PascalCase for class names
class_name PlayerController

# Use snake_case for variables and functions
var max_health = 100
var current_health = 100
var is_dead = false

# Constants should be ALL_CAPS
const MAX_SPEED = 500
const JUMP_FORCE = 1000

# Use explicit typing where possible
var speed: float = 300.0
var direction: Vector2 = Vector2.ZERO
var player_name: String = "Player"
var inventory: Array[Item] = []

# Signals should be in past tense
signal health_changed(new_health: int, old_health: int)
signal player_died()

# Group exports by category
@export_category("Movement")
@export var movement_speed: float = 300.0
@export var acceleration: float = 20.0
@export var friction: float = 10.0

@export_category("Combat")
@export var attack_damage: int = 10
@export var attack_range: float = 50.0

# Proper indentation and spacing for functions
func _ready() -> void:
	initialize_player()
	
	# Connect signals
	health_component.health_changed.connect(_on_health_changed)

func _physics_process(delta: float) -> void:
	# Process player movement
	var input_direction = get_input_direction()
	move_player(input_direction, delta)

# Add function docstrings for complex functions
## Moves the player based on input direction
## Parameters:
## - direction: Normalized input direction vector
## - delta: Physics delta time
func move_player(direction: Vector2, delta: float) -> void:
	if direction != Vector2.ZERO:
		velocity = velocity.move_toward(direction * movement_speed, acceleration * delta)
	else:
		velocity = velocity.move_toward(Vector2.ZERO, friction * delta)
	
	move_and_slide()
```

## Clear Conditional Logic in GDScript

```gdscript
# Bad - complex condition directly in if statement
if player.health > 0 and not player.is_stunned and player.stamina > 10 and not game_manager.is_paused and Input.is_action_just_pressed("attack"):
	execute_attack()

# Good - using descriptive variables to explain the conditions
var is_alive = player.health > 0
var is_not_stunned = not player.is_stunned
var has_enough_stamina = player.stamina > 10
var is_game_active = not game_manager.is_paused
var is_attack_button_pressed = Input.is_action_just_pressed("attack")

var can_execute_attack = is_alive and is_not_stunned and has_enough_stamina and is_game_active

if can_execute_attack and is_attack_button_pressed:
	execute_attack()

# Even better - wrap complex conditions in functions with descriptive names
func can_player_attack() -> bool:
	var is_alive = player.health > 0
	var is_not_stunned = not player.is_stunned
	var has_enough_stamina = player.stamina > 10
	var is_game_active = not game_manager.is_paused
	
	return is_alive and is_not_stunned and has_enough_stamina and is_game_active

func _process(delta: float) -> void:
	if can_player_attack() and Input.is_action_just_pressed("attack"):
		execute_attack()

# Using constants for game design values
# Bad - magic numbers
if global_position.distance_to(target_position) < 300.0:
	activate_pickup()

# Good - named constants
const PICKUP_RANGE = 300.0

if global_position.distance_to(target_position) < PICKUP_RANGE:
	activate_pickup()

# Better - use exported variables for configuration
@export var pickup_range: float = 300.0

if global_position.distance_to(target_position) < pickup_range:
	activate_pickup()

# Using match statements for cleaner multi-condition logic
var state = get_current_state()

# Bad - multiple if/elif
if state == "idle":
	play_idle_animation()
elif state == "walk":
	play_walk_animation()
elif state == "run":
	play_run_animation()
elif state == "jump":
	play_jump_animation()
else:
	play_idle_animation()

# Good - match statement
match state:
	"idle":
		play_idle_animation()
	"walk":
		play_walk_animation()
	"run":
		play_run_animation()
	"jump":
		play_jump_animation()
	_:  # Default case
		play_idle_animation()

# Using enums for even cleaner state handling
enum PlayerState {IDLE, WALK, RUN, JUMP, ATTACK}
var current_state = PlayerState.IDLE

match current_state:
	PlayerState.IDLE:
		play_idle_animation()
	PlayerState.WALK:
		play_walk_animation()
	PlayerState.RUN:
		play_run_animation()
	PlayerState.JUMP:
		play_jump_animation()
	PlayerState.ATTACK:
		play_attack_animation()
	_:
		play_idle_animation()
```

## Godot Node Structure and Organization

Godot's scene system allows for component-based design through composition:

```gdscript
# Player controller managing child components
extends CharacterBody2D

@onready var health_component: HealthComponent = $HealthComponent
@onready var weapon_component: WeaponComponent = $WeaponComponent
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var sprite: Sprite2D = $Sprite2D

func _ready() -> void:
	# Connect to component signals
	health_component.health_changed.connect(_on_health_changed)
	health_component.died.connect(_on_player_died)
	weapon_component.weapon_fired.connect(_on_weapon_fired)

func _process(delta: float) -> void:
	handle_input()
	update_animations()

func handle_input() -> void:
	if Input.is_action_just_pressed("attack") and weapon_component.can_fire():
		weapon_component.fire()

func _on_health_changed(new_health: int, old_health: int) -> void:
	# Update UI or play effects
	if new_health < old_health:
		animation_player.play("damage_flash")

func _on_player_died() -> void:
	# Handle player death
	animation_player.play("death")
	set_process(false)
	set_physics_process(false)
```

Health component as a reusable node:

```gdscript
# HealthComponent.gd
class_name HealthComponent
extends Node

signal health_changed(new_health: int, old_health: int)
signal died()

@export var max_health: int = 100
var current_health: int = max_health

func _ready() -> void:
	current_health = max_health

func take_damage(amount: int) -> void:
	var old_health = current_health
	current_health = max(0, current_health - amount)
	
	health_changed.emit(current_health, old_health)
	
	if current_health <= 0:
		died.emit()

func heal(amount: int) -> void:
	var old_health = current_health
	current_health = min(max_health, current_health + amount)
	
	health_changed.emit(current_health, old_health)

func is_alive() -> bool:
	return current_health > 0
```

## Resource-Based Design Pattern

Godot's Resource system provides a powerful way to create data-driven designs:

```gdscript
# WeaponData.gd - A custom resource type
class_name WeaponData
extends Resource

@export var weapon_name: String = "Unnamed Weapon"
@export var damage: int = 10
@export var fire_rate: float = 1.0
@export var ammo_capacity: int = 30
@export var reload_time: float = 1.5
@export var projectile_scene: PackedScene
@export var weapon_icon: Texture2D
@export var fire_sound: AudioStream

func get_dps() -> float:
	return damage * fire_rate
```

Using resources in game objects:

```gdscript
# Weapon.gd
class_name Weapon
extends Node2D

@export var weapon_data: WeaponData

var current_ammo: int = 0
var can_fire: bool = true
var time_since_last_shot: float = 0

@onready var fire_position: Marker2D = $FirePosition
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var audio_player: AudioStreamPlayer2D = $AudioStreamPlayer2D

func _ready() -> void:
	current_ammo = weapon_data.ammo_capacity
	audio_player.stream = weapon_data.fire_sound

func _process(delta: float) -> void:
	if not can_fire:
		time_since_last_shot += delta
		if time_since_last_shot >= (1.0 / weapon_data.fire_rate):
			can_fire = true
			time_since_last_shot = 0

func fire() -> void:
	if not can_fire or current_ammo <= 0:
		return
	
	can_fire = false
	current_ammo -= 1
	
	# Spawn projectile
	if weapon_data.projectile_scene:
		var projectile = weapon_data.projectile_scene.instantiate()
		get_tree().root.add_child(projectile)
		projectile.global_position = fire_position.global_position
		projectile.direction = global_position.direction_to(get_global_mouse_position())
		projectile.damage = weapon_data.damage
	
	# Play effects
	animation_player.play("fire")
	audio_player.play()

func reload() -> void:
	animation_player.play("reload")
	await animation_player.animation_finished
	current_ammo = weapon_data.ammo_capacity
```

## Autoload (Singleton) Pattern

Godot's Autoload feature allows for global access to manager objects:

```gdscript
# GameManager.gd - Set as an Autoload/singleton
extends Node

signal game_paused(is_paused: bool)
signal game_over(is_victory: bool)
signal score_changed(new_score: int)

var is_paused: bool = false
var current_score: int = 0
var high_score: int = 0

func _ready() -> void:
	load_high_score()

func toggle_pause() -> void:
	is_paused = not is_paused
	get_tree().paused = is_paused
	game_paused.emit(is_paused)

func add_score(points: int) -> void:
	current_score += points
	if current_score > high_score:
		high_score = current_score
		save_high_score()
	
	score_changed.emit(current_score)

func end_game(is_victory: bool) -> void:
	game_over.emit(is_victory)
	await get_tree().create_timer(3.0).timeout
	reload_current_scene()

func reload_current_scene() -> void:
	get_tree().reload_current_scene()

func load_high_score() -> void:
	var save_file = FileAccess.open("user://highscore.save", FileAccess.READ)
	if save_file:
		high_score = save_file.get_var()
		save_file.close()

func save_high_score() -> void:
	var save_file = FileAccess.open("user://highscore.save", FileAccess.WRITE)
	save_file.store_var(high_score)
	save_file.close()
```

Using the singleton in other scripts:

```gdscript
# Access singleton from any script
func _on_enemy_defeated(points: int) -> void:
	GameManager.add_score(points)

func _on_player_died() -> void:
	GameManager.end_game(false)

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("pause"):
		GameManager.toggle_pause()
```

## Signal-Based Communication

```gdscript
# Emitter.gd
extends Node

signal value_changed(new_value: int)
signal action_completed(success: bool, results: Dictionary)

func change_value(new_value: int) -> void:
	# Logic...
	value_changed.emit(new_value)

func perform_action() -> void:
	# Logic...
	var success = true
	var results = {"time": Time.get_ticks_msec(), "value": 100}
	action_completed.emit(success, results)
```

```gdscript
# Receiver.gd
extends Node

@export var emitter_path: NodePath
@onready var emitter = get_node(emitter_path)

func _ready() -> void:
	# Connect signals
	emitter.value_changed.connect(_on_value_changed)
	emitter.action_completed.connect(_on_action_completed)

func _on_value_changed(new_value: int) -> void:
	print("Value changed to: ", new_value)

func _on_action_completed(success: bool, results: Dictionary) -> void:
	if success:
		print("Action completed successfully with results: ", results)
	else:
		print("Action failed")
```

## State Pattern Implementation

```gdscript
# StateManager.gd
class_name StateManager
extends Node

var current_state: State
var states: Dictionary = {}

func _ready() -> void:
	# The first child state will be the default state
	for child in get_children():
		if child is State:
			states[child.name.to_lower()] = child
			if current_state == null:
				current_state = child
	
	# Initialize the current state
	if current_state:
		current_state.enter()

func _process(delta: float) -> void:
	if current_state:
		current_state.update(delta)

func _physics_process(delta: float) -> void:
	if current_state:
		current_state.physics_update(delta)

func _input(event: InputEvent) -> void:
	if current_state:
		current_state.handle_input(event)

func transition_to(state_name: String) -> void:
	if state_name.to_lower() in states:
		if current_state:
			current_state.exit()
		
		current_state = states[state_name.to_lower()]
		current_state.enter()
	else:
		push_error("State " + state_name + " not found")
```

```gdscript
# State.gd
class_name State
extends Node

# Reference to the parent that owns this state
var parent

func _ready() -> void:
	# Wait until the parent is ready
	await owner.ready
	parent = owner

func enter() -> void:
	pass

func exit() -> void:
	pass

func update(delta: float) -> void:
	pass

func physics_update(delta: float) -> void:
	pass

func handle_input(event: InputEvent) -> void:
	pass
```

```gdscript
# IdleState.gd
class_name IdleState
extends State

func enter() -> void:
	parent.animation_player.play("idle")

func update(delta: float) -> void:
	# Check if player should transition to another state
	if Input.is_action_pressed("move_right") or Input.is_action_pressed("move_left"):
		parent.state_manager.transition_to("walk")
	
	if Input.is_action_just_pressed("jump"):
		parent.state_manager.transition_to("jump")

func handle_input(event: InputEvent) -> void:
	if event.is_action_pressed("attack"):
		parent.state_manager.transition_to("attack")
```

## Optimization Techniques

```gdscript
# Use object pooling for frequently instantiated objects
class_name ObjectPool
extends Node

@export var scene_to_pool: PackedScene
@export var pool_size: int = 10

var pool: Array[Node] = []

func _ready() -> void:
	# Initialize the pool
	for i in range(pool_size):
		var instance = scene_to_pool.instantiate()
		instance.visible = false
		add_child(instance)
		pool.append(instance)

func get_object() -> Node:
	# Look for an inactive object in the pool
	for object in pool:
		if not object.visible:
			object.visible = true
			return object
	
	# If no inactive objects, expand the pool
	var instance = scene_to_pool.instantiate()
	add_child(instance)
	pool.append(instance)
	return instance

func release_object(object: Node) -> void:
	if object in pool:
		object.visible = false
```

```gdscript
# Use spatial partitioning for collision checks
class_name SpatialGrid
extends Node2D

@export var cell_size: Vector2 = Vector2(100, 100)
var grid: Dictionary = {}

func _ready() -> void:
	# Find all objects at startup and add them to grid
	register_objects()

func register_objects() -> void:
	var objects = get_tree().get_nodes_in_group("grid_objects")
	for object in objects:
		add_object(object)

func add_object(object: Node2D) -> void:
	var cell = world_to_cell(object.global_position)
	if not grid.has(cell):
		grid[cell] = []
	
	if not object in grid[cell]:
		grid[cell].append(object)

func remove_object(object: Node2D) -> void:
	var cell = world_to_cell(object.global_position)
	if grid.has(cell) and object in grid[cell]:
		grid[cell].erase(object)

func update_object_position(object: Node2D, old_position: Vector2) -> void:
	var old_cell = world_to_cell(old_position)
	var new_cell = world_to_cell(object.global_position)
	
	if old_cell != new_cell:
		if grid.has(old_cell) and object in grid[old_cell]:
			grid[old_cell].erase(object)
		
		add_object(object)

func world_to_cell(world_pos: Vector2) -> Vector2i:
	return Vector2i(floor(world_pos.x / cell_size.x), floor(world_pos.y / cell_size.y))

func get_objects_in_radius(center: Vector2, radius: float) -> Array:
	var cell_radius = ceil(radius / min(cell_size.x, cell_size.y))
	var center_cell = world_to_cell(center)
	var result: Array = []
	
	for x in range(center_cell.x - cell_radius, center_cell.x + cell_radius + 1):
		for y in range(center_cell.y - cell_radius, center_cell.y + cell_radius + 1):
			var cell = Vector2i(x, y)
			if grid.has(cell):
				for object in grid[cell]:
					if object.global_position.distance_to(center) <= radius:
						result.append(object)
	
	return result
```

## Project Structure Guidelines

```
/project
  /addons          # Custom plugins and extensions
  /assets          # Raw asset files (PSDs, FBX, etc.)
  /autoload        # Autoloaded scripts (singletons)
  /scenes          # Scene files (.tscn)
    /levels        # Game levels
    /ui            # UI scenes
    /player        # Player-related scenes
    /enemies       # Enemy-related scenes
    /props         # Environment props
  /scripts         # Shared scripts
    /components    # Reusable components
    /resources     # Custom resources
    /utils         # Utility scripts
  /resources       # Resource files
    /weapons       # Weapon data resources
    /items         # Item data resources
    /characters    # Character data resources
  /shaders         # Custom shader files
  /translations    # Localization files
```

## Debugging and Profiling

```gdscript
# Debugging helpers
func _ready() -> void:
	# Print debugging info only in debug mode
	if OS.is_debug_build():
		print("Debug info: ", get_debug_info())
	
	# Add runtime performance monitoring
	if OS.is_debug_build():
		add_performance_monitoring()

func get_debug_info() -> Dictionary:
	return {
		"engine_version": Engine.get_version_info(),
		"object_count": Performance.get_monitor(Performance.OBJECT_COUNT),
		"memory_usage": Performance.get_monitor(Performance.MEMORY_STATIC)
	}

func add_performance_monitoring() -> void:
	# Create performance display
	var performance_display = Label.new()
	performance_display.name = "PerformanceDisplay"
	get_tree().root.call_deferred("add_child", performance_display)
	
	# Update performance display every second
	var timer = Timer.new()
	timer.wait_time = 1.0
	timer.timeout.connect(func():
		performance_display.text = "FPS: %d\nObjects: %d\nMemory: %.2f MB" % [
			Performance.get_monitor(Performance.TIME_FPS),
			Performance.get_monitor(Performance.OBJECT_COUNT),
			Performance.get_monitor(Performance.MEMORY_STATIC) / 1048576.0
		]
	)
	add_child(timer)
	timer.start()
```

## Unit Testing

```gdscript
# TestCase.gd - Example test case using GUT (Godot Unit Testing) tool
extends GutTest

func test_health_component() -> void:
	# Create health component instance
	var health_component = HealthComponent.new()
	add_child(health_component)
	
	# Test initial health
	assert_eq(health_component.current_health, health_component.max_health, "Initial health should equal max health")
	
	# Test taking damage
	health_component.take_damage(20)
	assert_eq(health_component.current_health, health_component.max_health - 20, "Health should decrease by 20")
	
	# Test healing
	health_component.heal(10)
	assert_eq(health_component.current_health, health_component.max_health - 10, "Health should increase by 10")
	
	# Test death
	health_component.take_damage(health_component.max_health)
	assert_eq(health_component.current_health, 0, "Health should not go below 0")
	assert_false(health_component.is_alive(), "is_alive should return false")
	
	# Clean up
	health_component.queue_free()
``` 