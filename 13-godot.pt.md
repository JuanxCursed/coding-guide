# Godot Engine e GDScript: Guia de Melhores Práticas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](13-godot.md)
> - [Português](13-godot.pt.md)

## Diretrizes de Estilo GDScript

```gdscript
# Use PascalCase para nomes de classes
class_name ControladorJogador

# Use snake_case para variáveis e funções
var vida_maxima = 100
var vida_atual = 100
var esta_morto = false

# Constantes devem ser em MAIÚSCULAS
const VELOCIDADE_MAXIMA = 500
const FORCA_PULO = 1000

# Use tipagem explícita quando possível
var velocidade: float = 300.0
var direcao: Vector2 = Vector2.ZERO
var nome_jogador: String = "Jogador"
var inventario: Array[Item] = []

# Sinais devem estar no tempo passado
signal vida_alterada(nova_vida: int, vida_antiga: int)
signal jogador_morreu()

# Agrupe exports por categoria
@export_category("Movimento")
@export var velocidade_movimento: float = 300.0
@export var aceleracao: float = 20.0
@export var friccao: float = 10.0

@export_category("Combate")
@export var dano_ataque: int = 10
@export var alcance_ataque: float = 50.0

# Indentação e espaçamento adequados para funções
func _ready() -> void:
	inicializar_jogador()
	
	# Conectar sinais
	componente_vida.vida_alterada.connect(_ao_alterar_vida)

func _physics_process(delta: float) -> void:
	# Processar movimento do jogador
	var direcao_input = obter_direcao_input()
	mover_jogador(direcao_input, delta)

# Adicione docstrings para funções complexas
## Move o jogador baseado na direção do input
## Parâmetros:
## - direcao: Vetor de direção normalizado do input
## - delta: Tempo delta da física
func mover_jogador(direcao: Vector2, delta: float) -> void:
	if direcao != Vector2.ZERO:
		velocidade = velocidade.move_toward(direcao * velocidade_movimento, aceleracao * delta)
	else:
		velocidade = velocidade.move_toward(Vector2.ZERO, friccao * delta)
	
	move_and_slide()
```

## Lógica Condicional Clara em GDScript

```gdscript
# Ruim - condição complexa diretamente no if
if jogador.vida > 0 and not jogador.esta_atordoado and jogador.stamina > 10 and not gerenciador_jogo.esta_pausado and Input.is_action_just_pressed("atacar"):
	executar_ataque()

# Bom - usando variáveis descritivas para explicar as condições
var esta_vivo = jogador.vida > 0
var nao_esta_atordoado = not jogador.esta_atordoado
var tem_stamina_suficiente = jogador.stamina > 10
var jogo_esta_ativo = not gerenciador_jogo.esta_pausado
var botao_ataque_pressionado = Input.is_action_just_pressed("atacar")

var pode_executar_ataque = esta_vivo and nao_esta_atordoado and tem_stamina_suficiente and jogo_esta_ativo

if pode_executar_ataque and botao_ataque_pressionado:
	executar_ataque()

# Ainda melhor - envolva condições complexas em funções com nomes descritivos
func jogador_pode_atacar() -> bool:
	var esta_vivo = jogador.vida > 0
	var nao_esta_atordoado = not jogador.esta_atordoado
	var tem_stamina_suficiente = jogador.stamina > 10
	var jogo_esta_ativo = not gerenciador_jogo.esta_pausado
	
	return esta_vivo and nao_esta_atordoado and tem_stamina_suficiente and jogo_esta_ativo

func _process(delta: float) -> void:
	if jogador_pode_atacar() and Input.is_action_just_pressed("atacar"):
		executar_ataque()

# Usando constantes para valores de design do jogo
# Ruim - números mágicos
if global_position.distance_to(posicao_alvo) < 300.0:
	ativar_coleta()

# Bom - constantes nomeadas
const ALCANCE_COLETA = 300.0

if global_position.distance_to(posicao_alvo) < ALCANCE_COLETA:
	ativar_coleta()

# Melhor - use variáveis exportadas para configuração
@export var alcance_coleta: float = 300.0

if global_position.distance_to(posicao_alvo) < alcance_coleta:
	ativar_coleta()

# Usando match para lógica multi-condição mais limpa
var estado = obter_estado_atual()

# Ruim - múltiplos if/elif
if estado == "parado":
	tocar_animacao_parado()
elif estado == "andando":
	tocar_animacao_andando()
elif estado == "correndo":
	tocar_animacao_correndo()
elif estado == "pulando":
	tocar_animacao_pulando()
else:
	tocar_animacao_parado()

# Bom - declaração match
match estado:
	"parado":
		tocar_animacao_parado()
	"andando":
		tocar_animacao_andando()
	"correndo":
		tocar_animacao_correndo()
	"pulando":
		tocar_animacao_pulando()
	_:  # Caso padrão
		tocar_animacao_parado()

# Usando enums para manipulação de estado ainda mais limpa
enum EstadoJogador {PARADO, ANDANDO, CORRENDO, PULANDO, ATACANDO}
var estado_atual = EstadoJogador.PARADO

match estado_atual:
	EstadoJogador.PARADO:
		tocar_animacao_parado()
	EstadoJogador.ANDANDO:
		tocar_animacao_andando()
	EstadoJogador.CORRENDO:
		tocar_animacao_correndo()
	EstadoJogador.PULANDO:
		tocar_animacao_pulando()
	EstadoJogador.ATACANDO:
		tocar_animacao_atacando()
	_:
		tocar_animacao_parado()
```

## Estrutura e Organização de Nós no Godot

O sistema de cenas do Godot permite design baseado em componentes através de composição:

```gdscript
# Controlador do jogador gerenciando componentes filhos
extends CharacterBody2D

@onready var componente_vida: ComponenteVida = $ComponenteVida
@onready var componente_arma: ComponenteArma = $ComponenteArma
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var sprite: Sprite2D = $Sprite2D

func _ready() -> void:
	# Conectar aos sinais dos componentes
	componente_vida.vida_alterada.connect(_ao_alterar_vida)
	componente_vida.morreu.connect(_ao_jogador_morrer)
	componente_arma.arma_disparada.connect(_ao_disparar_arma)

func _process(delta: float) -> void:
	processar_input()
	atualizar_animacoes()

func processar_input() -> void:
	if Input.is_action_just_pressed("atacar") and componente_arma.pode_disparar():
		componente_arma.disparar()

func _ao_alterar_vida(nova_vida: int, vida_antiga: int) -> void:
	# Atualizar UI ou tocar efeitos
	if nova_vida < vida_antiga:
		animation_player.play("flash_dano")

func _ao_jogador_morrer() -> void:
	# Lidar com a morte do jogador
	animation_player.play("morte")
	set_process(false)
	set_physics_process(false)
```

Componente de vida como um nó reutilizável:

```gdscript
# ComponenteVida.gd
class_name ComponenteVida
extends Node

signal vida_alterada(nova_vida: int, vida_antiga: int)
signal morreu()

@export var vida_maxima: int = 100
var vida_atual: int = vida_maxima

func _ready() -> void:
	vida_atual = vida_maxima

func receber_dano(quantidade: int) -> void:
	var vida_antiga = vida_atual
	vida_atual = max(0, vida_atual - quantidade)
	
	vida_alterada.emit(vida_atual, vida_antiga)
	
	if vida_atual <= 0:
		morreu.emit()

func curar(quantidade: int) -> void:
	var vida_antiga = vida_atual
	vida_atual = min(vida_maxima, vida_atual + quantidade)
	
	vida_alterada.emit(vida_atual, vida_antiga)

func esta_vivo() -> bool:
	return vida_atual > 0
```

## Padrão de Design Baseado em Recursos

O sistema de Resources do Godot fornece uma maneira poderosa de criar designs orientados a dados:

```gdscript
# DadosArma.gd - Um tipo de recurso personalizado
class_name DadosArma
extends Resource

@export var nome_arma: String = "Arma Sem Nome"
@export var dano: int = 10
@export var taxa_disparo: float = 1.0
@export var capacidade_municao: int = 30
@export var tempo_recarga: float = 1.5
@export var cena_projetil: PackedScene
@export var icone_arma: Texture2D
@export var som_disparo: AudioStream

# Implementação do componente de arma
class_name ComponenteArma
extends Node2D

@export var dados_arma: DadosArma
var municao_atual: int
var tempo_ultimo_disparo: float = 0.0

func _ready() -> void:
	if dados_arma:
		municao_atual = dados_arma.capacidade_municao

func pode_disparar() -> bool:
	return municao_atual > 0 and Time.get_ticks_msec() / 1000.0 - tempo_ultimo_disparo >= 1.0 / dados_arma.taxa_disparo

func disparar() -> void:
	if not pode_disparar():
		return
	
	var projetil = dados_arma.cena_projetil.instantiate()
	# Configurar projetil
	get_tree().current_scene.add_child(projetil)
	
	municao_atual -= 1
	tempo_ultimo_disparo = Time.get_ticks_msec() / 1000.0
	
	# Tocar efeitos
	if dados_arma.som_disparo:
		AudioStreamPlayer2D.new().stream = dados_arma.som_disparo
```

## Sistema de Eventos

```gdscript
# Barramento de eventos global
extends Node

# Sinais para eventos do jogo
signal item_coletado(item_id: String, quantidade: int)
signal pontuacao_alterada(nova_pontuacao: int)
signal nivel_completado(nivel_id: String, tempo: float)
signal jogo_pausado()
signal jogo_retomado()

# Uso em outros scripts
extends Node

func _ready() -> void:
	# Conectar aos eventos
	EventosBus.item_coletado.connect(_ao_coletar_item)
	EventosBus.pontuacao_alterada.connect(_ao_alterar_pontuacao)

func _ao_coletar_item(item_id: String, quantidade: int) -> void:
	# Atualizar inventário
	atualizar_inventario(item_id, quantidade)

func _ao_alterar_pontuacao(nova_pontuacao: int) -> void:
	# Atualizar UI
	atualizar_ui_pontuacao(nova_pontuacao)

# Emitir eventos
func coletar_item(item: Node) -> void:
	# Lógica de coleta
	EventosBus.item_coletado.emit(item.id, item.quantidade)
```

## Otimização e Performance

```gdscript
# Cache nós frequentemente acessados
@onready var _camera: Camera2D = $Camera2D
@onready var _animation_player: AnimationPlayer = $AnimationPlayer
@onready var _sprite: Sprite2D = $Sprite2D

# Use grupos para gerenciamento eficiente de entidades
func _ready() -> void:
	add_to_group("inimigos")
	add_to_group("entidades_dano")

# Em outro script
func aplicar_dano_area() -> void:
	for inimigo in get_tree().get_nodes_in_group("inimigos"):
		if esta_na_area(inimigo):
			inimigo.receber_dano(dano)

# Evite processamento desnecessário
var _tempo_acumulado: float = 0.0
const INTERVALO_ATUALIZACAO: float = 0.1

func _process(delta: float) -> void:
	_tempo_acumulado += delta
	if _tempo_acumulado >= INTERVALO_ATUALIZACAO:
		_tempo_acumulado = 0.0
		atualizar_estado()

# Use Object Pooling para objetos frequentemente criados/destruídos
class_name PoolProjeteis
extends Node

var _pool: Array[Node] = []
@export var cena_projetil: PackedScene
@export var tamanho_inicial: int = 20

func _ready() -> void:
	for i in tamanho_inicial:
		var projetil = cena_projetil.instantiate()
		_pool.append(projetil)
		projetil.process_mode = Node.PROCESS_MODE_DISABLED
		add_child(projetil)

func obter_projetil() -> Node:
	for projetil in _pool:
		if not projetil.process_mode == Node.PROCESS_MODE_INHERIT:
			projetil.process_mode = Node.PROCESS_MODE_INHERIT
			return projetil
	
	# Criar novo se necessário
	var novo_projetil = cena_projetil.instantiate()
	_pool.append(novo_projetil)
	add_child(novo_projetil)
	return novo_projetil

func devolver_projetil(projetil: Node) -> void:
	projetil.process_mode = Node.PROCESS_MODE_DISABLED
``` 