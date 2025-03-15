# Unity: Guia de Melhores Práticas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](11-unity.md)
> - [Português](11-unity.pt.md)

## Scripts C# no Unity

```csharp
// Use convenções de nomenclatura adequadas
public class ControladorJogador : MonoBehaviour // PascalCase para nomes de classes
{
    // Campos públicos visíveis no Inspector
    public float velocidadeMovimento = 5f; // camelCase para variáveis
    
    // Serialize campos privados para torná-los visíveis no Inspector
    [SerializeField] 
    private float _forcaPulo = 10f; // Use prefixo _ para campos privados
    
    // Propriedades (preferível a campos públicos)
    public int Vida { get; private set; } = 100;
    
    // Cache referências de componentes
    private Rigidbody _rigidbody;
    private Animator _animator;
    
    // Inicialize no Awake, não no construtor
    private void Awake()
    {
        // Cache referências de componentes
        _rigidbody = GetComponent<Rigidbody>();
        _animator = GetComponent<Animator>();
    }
    
    // Use Start para inicialização que depende de outros GameObjects
    private void Start()
    {
        // Inicializa estado do jogo
        Vida = CalcularVidaInicial();
    }
    
    // Update é chamado uma vez por frame (use para input e mudanças de estado)
    private void Update()
    {
        ProcessarInput();
        AtualizarAnimacoes();
    }
    
    // FixedUpdate é chamado em intervalos fixos (use para física)
    private void FixedUpdate()
    {
        AplicarMovimento();
    }
    
    // Divida a funcionalidade em métodos separados
    private void ProcessarInput()
    {
        // Lógica de input
    }
    
    private void AtualizarAnimacoes()
    {
        // Atualiza animações baseado no estado
    }
    
    private void AplicarMovimento()
    {
        // Aplica movimento físico
    }
    
    private int CalcularVidaInicial()
    {
        // Calcula vida inicial
        return 100;
    }
}
```

## Lógica Condicional Clara em Scripts Unity

```csharp
// Ruim - condição complexa diretamente no if
if (jogador.Vida > 0 && !jogador.EstaAtordoado && jogador.Stamina > 10 && !gerenciadorJogo.EstaPausado && Input.GetButtonDown("Atacar"))
{
    ExecutarAtaque();
}

// Bom - usando variáveis descritivas para explicar as condições
bool jogadorEstaVivo = jogador.Vida > 0;
bool naoEstaAtordoado = !jogador.EstaAtordoado;
bool temStaminaSuficiente = jogador.Stamina > 10;
bool jogoEstaAtivo = !gerenciadorJogo.EstaPausado;
bool botaoAtaquePrecionado = Input.GetButtonDown("Atacar");

bool podeExecutarAtaque = jogadorEstaVivo && naoEstaAtordoado && temStaminaSuficiente && jogoEstaAtivo;

if (podeExecutarAtaque && botaoAtaquePrecionado)
{
    ExecutarAtaque();
}

// Ainda melhor - envolva condições complexas em métodos com nomes descritivos
private bool JogadorPodeAtacar()
{
    bool jogadorEstaVivo = jogador.Vida > 0;
    bool naoEstaAtordoado = !jogador.EstaAtordoado;
    bool temStaminaSuficiente = jogador.Stamina > 10;
    bool jogoEstaAtivo = !gerenciadorJogo.EstaPausado;
    
    return jogadorEstaVivo && naoEstaAtordoado && temStaminaSuficiente && jogoEstaAtivo;
}

private void Update()
{
    if (JogadorPodeAtacar() && Input.GetButtonDown("Atacar"))
    {
        ExecutarAtaque();
    }
}

// Usando constantes para valores de design do jogo
// Ruim - números mágicos
if (distanciaAoAlvo < 3f)
{
    AtivarColeta();
}

// Bom - constantes nomeadas
private const float ALCANCE_COLETA = 3f;

if (distanciaAoAlvo < ALCANCE_COLETA)
{
    AtivarColeta();
}

// Ainda melhor - mova a configuração para ScriptableObjects
[CreateAssetMenu(fileName = "ConfiguracoesJogador", menuName = "Jogo/Configurações do Jogador")]
public class ConfiguracoesJogador : ScriptableObject
{
    public float alcanceColeta = 3f;
    public float velocidadeMovimento = 5f;
    public float forcaPulo = 10f;
}

// Então no seu script:
[SerializeField] private ConfiguracoesJogador _configuracoes;

if (distanciaAoAlvo < _configuracoes.alcanceColeta)
{
    AtivarColeta();
}
```

## Padrões de Arquitetura Unity

### 1. Padrão Singleton (Use com Cuidado)

```csharp
// Singleton com inicialização preguiçosa
public class GerenciadorJogo : MonoBehaviour
{
    private static GerenciadorJogo _instancia;
    
    // Propriedade pública com segurança de thread
    public static GerenciadorJogo Instancia
    {
        get
        {
            if (_instancia == null)
            {
                _instancia = FindObjectOfType<GerenciadorJogo>();
                
                if (_instancia == null)
                {
                    GameObject objetoGerenciador = new GameObject("GerenciadorJogo");
                    _instancia = objetoGerenciador.AddComponent<GerenciadorJogo>();
                }
            }
            
            return _instancia;
        }
    }
    
    private void Awake()
    {
        // Garante que apenas uma instância existe
        if (_instancia != null && _instancia != this)
        {
            Destroy(gameObject);
            return;
        }
        
        _instancia = this;
        DontDestroyOnLoad(gameObject);
    }
    
    // Funcionalidade do gerenciador de jogo...
}

// Uso
GerenciadorJogo.Instancia.IniciarNovoJogo();
```

### 2. Padrão Estado

```csharp
// Interface de estado
public interface IEstadoJogador
{
    void Entrar(ControladorJogador jogador);
    void Atualizar(ControladorJogador jogador);
    void AtualizacaoFixa(ControladorJogador jogador);
    void Sair(ControladorJogador jogador);
}

// Estado concreto
public class EstadoJogadorParado : IEstadoJogador
{
    public void Entrar(ControladorJogador jogador)
    {
        jogador.Animator.Play("Parado");
    }
    
    public void Atualizar(ControladorJogador jogador)
    {
        // Verifica transições de estado
        if (Input.GetAxis("Horizontal") != 0 || Input.GetAxis("Vertical") != 0)
        {
            jogador.TransicionarParaEstado(new EstadoJogadorMovendo());
        }
        
        if (Input.GetButtonDown("Jump"))
        {
            jogador.TransicionarParaEstado(new EstadoJogadorPulando());
        }
    }
    
    public void AtualizacaoFixa(ControladorJogador jogador)
    {
        // Aplica física se necessário
    }
    
    public void Sair(ControladorJogador jogador)
    {
        // Limpeza
    }
}

// Controlador do jogador usando estados
public class ControladorJogador : MonoBehaviour
{
    public Animator Animator { get; private set; }
    public Rigidbody Rigidbody { get; private set; }
    
    private IEstadoJogador _estadoAtual;
    
    private void Awake()
    {
        Animator = GetComponent<Animator>();
        Rigidbody = GetComponent<Rigidbody>();
    }
    
    private void Start()
    {
        TransicionarParaEstado(new EstadoJogadorParado());
    }
    
    private void Update()
    {
        _estadoAtual?.Atualizar(this);
    }
    
    private void FixedUpdate()
    {
        _estadoAtual?.AtualizacaoFixa(this);
    }
    
    public void TransicionarParaEstado(IEstadoJogador novoEstado)
    {
        _estadoAtual?.Sair(this);
        _estadoAtual = novoEstado;
        _estadoAtual?.Entrar(this);
    }
}
```

### 3. Padrão Observador (Sistema de Eventos)

```csharp
// Definindo eventos
public class EventosJogo : MonoBehaviour
{
    public static EventosJogo Instancia { get; private set; }
    
    // Eventos
    public event System.Action<int> OnPontuacaoAlterada;
    public event System.Action<int> OnVidaAlterada;
    public event System.Action OnGameOver;
    
    private void Awake()
    {
        if (Instancia == null)
        {
            Instancia = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
    
    // Métodos para disparar eventos
    public void DispararPontuacaoAlterada(int novaPontuacao)
    {
        OnPontuacaoAlterada?.Invoke(novaPontuacao);
    }
    
    public void DispararVidaAlterada(int novaVida)
    {
        OnVidaAlterada?.Invoke(novaVida);
    }
    
    public void DispararGameOver()
    {
        OnGameOver?.Invoke();
    }
}

// Uso em outros scripts
public class UIJogador : MonoBehaviour
{
    private TextMeshProUGUI _textoPontuacao;
    private TextMeshProUGUI _textoVida;
    
    private void OnEnable()
    {
        EventosJogo.Instancia.OnPontuacaoAlterada += AtualizarPontuacao;
        EventosJogo.Instancia.OnVidaAlterada += AtualizarVida;
    }
    
    private void OnDisable()
    {
        EventosJogo.Instancia.OnPontuacaoAlterada -= AtualizarPontuacao;
        EventosJogo.Instancia.OnVidaAlterada -= AtualizarVida;
    }
    
    private void AtualizarPontuacao(int novaPontuacao)
    {
        _textoPontuacao.text = $"Pontuação: {novaPontuacao}";
    }
    
    private void AtualizarVida(int novaVida)
    {
        _textoVida.text = $"Vida: {novaVida}";
    }
}
```

### 4. Padrão Comando

```csharp
// Interface de comando
public interface IComando
{
    void Executar();
    void Desfazer();
}

// Comando concreto
public class ComandoMover : IComando
{
    private Transform _transform;
    private Vector3 _direcao;
    private float _distancia;
    private Vector3 _posicaoAnterior;
    
    public ComandoMover(Transform transform, Vector3 direcao, float distancia)
    {
        _transform = transform;
        _direcao = direcao;
        _distancia = distancia;
    }
    
    public void Executar()
    {
        _posicaoAnterior = _transform.position;
        _transform.Translate(_direcao * _distancia);
    }
    
    public void Desfazer()
    {
        _transform.position = _posicaoAnterior;
    }
}

// Gerenciador de comandos
public class GerenciadorComandos : MonoBehaviour
{
    private Stack<IComando> _historicoComandos = new Stack<IComando>();
    
    public void ExecutarComando(IComando comando)
    {
        comando.Executar();
        _historicoComandos.Push(comando);
    }
    
    public void DesfazerUltimoComando()
    {
        if (_historicoComandos.Count > 0)
        {
            IComando comando = _historicoComandos.Pop();
            comando.Desfazer();
        }
    }
}

// Uso
public class ControladorJogador : MonoBehaviour
{
    [SerializeField] private float _distanciaMovimento = 1f;
    private GerenciadorComandos _gerenciadorComandos;
    
    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.RightArrow))
        {
            IComando comando = new ComandoMover(transform, Vector3.right, _distanciaMovimento);
            _gerenciadorComandos.ExecutarComando(comando);
        }
        
        if (Input.GetKeyDown(KeyCode.Z))
        {
            _gerenciadorComandos.DesfazerUltimoComando();
        }
    }
}
```

### 5. Otimização e Performance

```csharp
// Cache resultados de operações caras
public class GerenciadorInimigos : MonoBehaviour
{
    private Transform _transformJogador;
    private List<Inimigo> _inimigos = new List<Inimigo>();
    private Dictionary<int, Inimigo> _inimigosPorID = new Dictionary<int, Inimigo>();
    
    // Use estruturas de dados apropriadas
    private HashSet<Inimigo> _inimigosAtivos = new HashSet<Inimigo>();
    
    // Evite alocações em Update
    private readonly Vector3[] _direcoesBusca = new Vector3[8];
    private readonly List<RaycastHit> _hitsCache = new List<RaycastHit>();
    
    private void Awake()
    {
        // Inicializa cache de direções uma vez
        for (int i = 0; i < 8; i++)
        {
            float angulo = i * 45f * Mathf.Deg2Rad;
            _direcoesBusca[i] = new Vector3(Mathf.Cos(angulo), 0f, Mathf.Sin(angulo));
        }
    }
    
    // Use Object Pooling para objetos frequentemente criados/destruídos
    public class PoolInimigos : MonoBehaviour
    {
        [SerializeField] private GameObject _prefabInimigo;
        [SerializeField] private int _tamanhoInicial = 20;
        
        private Queue<GameObject> _poolInimigos = new Queue<GameObject>();
        
        private void Start()
        {
            for (int i = 0; i < _tamanhoInicial; i++)
            {
                CriarNovoInimigo();
            }
        }
        
        private void CriarNovoInimigo()
        {
            GameObject inimigo = Instantiate(_prefabInimigo);
            inimigo.SetActive(false);
            _poolInimigos.Enqueue(inimigo);
        }
        
        public GameObject ObterInimigo()
        {
            if (_poolInimigos.Count == 0)
            {
                CriarNovoInimigo();
            }
            
            GameObject inimigo = _poolInimigos.Dequeue();
            inimigo.SetActive(true);
            return inimigo;
        }
        
        public void DevolverInimigo(GameObject inimigo)
        {
            inimigo.SetActive(false);
            _poolInimigos.Enqueue(inimigo);
        }
    }
}
```

### 6. Testes

```csharp
// Usando Unity Test Framework
public class TestesJogador
{
    private ControladorJogador _jogador;
    private Mock<IServicoSaude> _mockServicoSaude;
    
    [SetUp]
    public void Setup()
    {
        GameObject objetoJogador = new GameObject();
        _jogador = objetoJogador.AddComponent<ControladorJogador>();
        
        _mockServicoSaude = new Mock<IServicoSaude>();
        _jogador.InicializarServicos(_mockServicoSaude.Object);
    }
    
    [Test]
    public void ReceberDano_ReduzVida()
    {
        // Arrange
        int vidaInicial = 100;
        int dano = 20;
        _jogador.Vida = vidaInicial;
        
        // Act
        _jogador.ReceberDano(dano);
        
        // Assert
        Assert.AreEqual(vidaInicial - dano, _jogador.Vida);
    }
    
    [Test]
    public void Curar_NaoUltrapassaVidaMaxima()
    {
        // Arrange
        int vidaMaxima = 100;
        int cura = 50;
        _jogador.Vida = vidaMaxima;
        
        // Act
        _jogador.Curar(cura);
        
        // Assert
        Assert.AreEqual(vidaMaxima, _jogador.Vida);
    }
    
    [TearDown]
    public void Cleanup()
    {
        Object.Destroy(_jogador.gameObject);
    }
}
``` 