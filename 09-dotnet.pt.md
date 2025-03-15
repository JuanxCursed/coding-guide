# .NET: Guia de Melhores Práticas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](09-dotnet.md)
> - [Português](09-dotnet.pt.md)

## Estilo de Código

```csharp
// Use nomes significativos e descritivos
public int ContarUsuariosAtivos() // Bom
public int Contar() // Muito genérico

// Prefira membros com corpo de expressão para métodos simples
public string ObterNomeCompleto() => $"{PrimeiroNome} {Sobrenome}";

// Use interpolação de strings em vez de concatenação
var mensagem = $"Olá, {usuario.Nome}!"; // Bom
var mensagem = "Olá, " + usuario.Nome + "!"; // Menos legível

// Use pattern matching para verificação de tipo e casting
if (entidade is Cliente cliente)
{
    // Use cliente diretamente sem casting
}

// Use operadores condicionais nulos e de coalescência
var nome = usuario?.Nome ?? "Anônimo";
```

## Melhores Práticas C#

### 1. Princípios SOLID

```csharp
// Princípio da Responsabilidade Única
// Classes devem ter apenas um motivo para mudar
public class RepositorioCliente
{
    // Lida APENAS com acesso a dados para clientes
    public Cliente ObterPorId(int id) => /* acesso ao banco de dados */;
    public void Salvar(Cliente cliente) => /* acesso ao banco de dados */;
}

public class ValidadorCliente 
{
    // Lida APENAS com validação de clientes
    public bool EhValido(Cliente cliente) => /* lógica de validação */;
}

// Princípio Aberto/Fechado
// Aberto para extensão, fechado para modificação
public abstract class ProcessadorPagamento
{
    public abstract Task<ResultadoPagamento> ProcessarPagamento(Pagamento pagamento);
}

public class ProcessadorCartaoCredito : ProcessadorPagamento
{
    public override Task<ResultadoPagamento> ProcessarPagamento(Pagamento pagamento) 
        => /* Lógica de cartão de crédito */;
}

public class ProcessadorPayPal : ProcessadorPagamento
{
    public override Task<ResultadoPagamento> ProcessarPagamento(Pagamento pagamento) 
        => /* Lógica do PayPal */;
}

// Princípio da Substituição de Liskov
// Subtipos devem ser substituíveis por seus tipos base
public interface IRepositorio<T>
{
    T ObterPorId(int id);
    void Salvar(T entidade);
    void Excluir(T entidade);
}

public class RepositorioCliente : IRepositorio<Cliente>
{
    // Deve implementar todos os métodos corretamente
}

// Princípio da Segregação de Interface
// Muitas interfaces específicas são melhores que uma interface de propósito geral
public interface IRepositorioSomenteLeitura<T>
{
    T ObterPorId(int id);
    IEnumerable<T> ObterTodos();
}

public interface IRepositorioSomenteEscrita<T>
{
    void Salvar(T entidade);
    void Excluir(T entidade);
}

// Princípio da Inversão de Dependência
// Dependa de abstrações, não de implementações concretas
public class ServicoPedido
{
    private readonly IRepositorio<Pedido> _repositorioPedido;
    
    // Injeta a dependência
    public ServicoPedido(IRepositorio<Pedido> repositorioPedido)
    {
        _repositorioPedido = repositorioPedido;
    }
    
    public Pedido ObterPedido(int id) => _repositorioPedido.ObterPorId(id);
}
```

### 2. Programação Assíncrona

```csharp
// Use async/await para operações I/O-bound
public async Task<Cliente> ObterClienteAsync(int id)
{
    return await _dbContext.Clientes.FindAsync(id);
}

// Use convenção de nomenclatura adequada para métodos async
public async Task ProcessarPedidoAsync() // Bom
public async Task ProcessarPedido() // Faltando sufixo Async

// Use ConfigureAwait(false) em código de biblioteca
public async Task<Dados> ObterDadosDoServicoAsync()
{
    var resposta = await _httpClient.GetAsync("api/dados")
        .ConfigureAwait(false);
    return await resposta.Content.ReadAsAsync<Dados>()
        .ConfigureAwait(false);
}

// Use Task.WhenAll para execução paralela
public async Task ProcessarMultiplosPedidosAsync(IEnumerable<Pedido> pedidos)
{
    var tarefas = pedidos.Select(ProcessarPedidoAsync);
    await Task.WhenAll(tarefas);
}

// Não use async void exceto para manipuladores de eventos
public async void Botao_Click(object sender, EventArgs e)
{
    await ProcessarPedidoAsync();
}

// Use CancellationToken para operações canceláveis
public async Task<Dados> ObterDadosAsync(CancellationToken cancellationToken = default)
{
    return await _httpClient.GetFromJsonAsync<Dados>("api/dados", cancellationToken);
}
```

### 3. Lógica Condicional Clara

```csharp
// Ruim - condição complexa diretamente no if
if (usuario.Idade >= 18 && usuario.EstaVerificado && !usuario.EstaBanido && usuario.Assinatura.EstaAtiva)
{
    PermitirAcesso();
}

// Bom - usando variáveis descritivas para explicar as condições
bool ehAdulto = usuario.Idade >= 18;
bool estaVerificado = usuario.EstaVerificado;
bool naoEstaBanido = !usuario.EstaBanido;
bool temAssinaturaAtiva = usuario.Assinatura.EstaAtiva;

if (ehAdulto && estaVerificado && naoEstaBanido && temAssinaturaAtiva)
{
    PermitirAcesso();
}

// Ainda melhor - envolva condições complexas em métodos com nomes descritivos
public bool PodeAcessarConteudo(Usuario usuario)
{
    bool ehAdulto = usuario.Idade >= 18;
    bool estaVerificado = usuario.EstaVerificado;
    bool naoEstaBanido = !usuario.EstaBanido;
    bool temAssinaturaAtiva = usuario.Assinatura.EstaAtiva;
    
    return ehAdulto && estaVerificado && naoEstaBanido && temAssinaturaAtiva;
}

if (PodeAcessarConteudo(usuario))
{
    PermitirAcesso();
}

// Usando constantes para condições de limite
// Ruim - números mágicos
if (temperatura > 30)
{
    MostrarAvisoCalor();
}

// Bom - constantes nomeadas
const double LimiteTemperaturaAlta = 30;

if (temperatura > LimiteTemperaturaAlta)
{
    MostrarAvisoCalor();
}

// Use expressões switch para lógica multi-condição (C# 8+)
public string ObterNivelDesconto(decimal totalCompra) => totalCompra switch
{
    <= 50 => "Nenhum",
    > 50 and <= 100 => "Bronze",
    > 100 and <= 500 => "Prata",
    > 500 => "Ouro",
};
```

### 4. Tratamento de Exceções

```csharp
// Use exceções específicas
public Cliente ObterCliente(int id)
{
    if (id <= 0)
    {
        throw new ArgumentException("ID do cliente deve ser positivo", nameof(id));
    }
    
    var cliente = _repositorio.ObterPorId(id);
    if (cliente == null)
    {
        throw new ClienteNaoEncontradoException(id);
    }
    
    return cliente;
}

// Use try/catch apenas quando você pode tratar a exceção
public bool TentarObterCliente(int id, out Cliente cliente)
{
    try
    {
        cliente = ObterCliente(id);
        return true;
    }
    catch (ClienteNaoEncontradoException)
    {
        cliente = null;
        return false;
    }
}

// Prefira filtros de exceção
try
{
    await ProcessarPedidoAsync();
}
catch (Exception ex) when (ex is TimeoutException || ex is HttpRequestException)
{
    // Trata exceções específicas de rede
}
```

### 5. Coleções e LINQ

```csharp
// Use LINQ para operações em coleções
var clientesAtivos = clientes
    .Where(c => c.EstaAtivo)
    .OrderBy(c => c.Nome)
    .ToList();

// Use métodos de extensão para lógica reutilizável
public static class ClienteExtensions
{
    public static IEnumerable<Cliente> ApenasAtivos(this IEnumerable<Cliente> clientes)
        => clientes.Where(c => c.EstaAtivo);
        
    public static IEnumerable<Cliente> ComComprasRecentes(this IEnumerable<Cliente> clientes)
        => clientes.Where(c => c.UltimaCompra >= DateTime.Now.AddDays(-30));
}

// Use tipos apropriados de coleção
public class CarrinhoCompras
{
    private readonly HashSet<Produto> _itens = new();  // Para itens únicos
    private readonly Dictionary<int, Produto> _produtosPorId = new();  // Para busca rápida
    private readonly Queue<Pedido> _pedidosPendentes = new();  // Para processamento FIFO
}
```

### 6. Testes

```csharp
// Use nomes descritivos para testes
[Fact]
public void CalcularTotal_ComDescontoAplicado_RetornaTotalCorreto()
{
    // Arrange
    var pedido = new Pedido();
    pedido.AdicionarItem(new Produto { Preco = 100 });
    var desconto = new Desconto { Percentual = 10 };
    
    // Act
    var total = pedido.CalcularTotal(desconto);
    
    // Assert
    Assert.Equal(90, total);
}

// Use fixtures para configuração compartilhada
public class ClienteTests : IClassFixture<DatabaseFixture>
{
    private readonly DatabaseFixture _fixture;
    
    public ClienteTests(DatabaseFixture fixture)
    {
        _fixture = fixture;
    }
    
    [Fact]
    public async Task ObterCliente_ClienteExiste_RetornaCliente()
    {
        // Arrange
        var repositorio = new ClienteRepositorio(_fixture.Context);
        
        // Act
        var cliente = await repositorio.ObterPorIdAsync(1);
        
        // Assert
        Assert.NotNull(cliente);
        Assert.Equal("João", cliente.Nome);
    }
}

// Use dados de teste parametrizados
[Theory]
[InlineData(0, 100, 0)]
[InlineData(10, 100, 10)]
[InlineData(50, 100, 50)]
public void CalcularDesconto_RetornaValorCorreto(
    decimal percentual,
    decimal valor,
    decimal descontoEsperado)
{
    var desconto = new Desconto { Percentual = percentual };
    var valorComDesconto = desconto.Calcular(valor);
    Assert.Equal(descontoEsperado, valorComDesconto);
}
```

### 7. Documentação

```csharp
/// <summary>
/// Processa um pedido e retorna o resultado do processamento.
/// </summary>
/// <param name="pedido">O pedido a ser processado.</param>
/// <param name="opcoes">Opções de processamento opcionais.</param>
/// <returns>O resultado do processamento do pedido.</returns>
/// <exception cref="PedidoInvalidoException">
/// Lançada quando o pedido não atende aos requisitos mínimos.
/// </exception>
public async Task<ResultadoPedido> ProcessarPedidoAsync(
    Pedido pedido,
    OpcoesProcessamento opcoes = null)
{
    // Implementação
}

// Use atributos para documentar comportamentos especiais
[Obsolete("Use ProcessarPedidoAsync em vez deste método")]
public void ProcessarPedido(Pedido pedido)
{
    // Implementação antiga
}

[EditorBrowsable(EditorBrowsableState.Never)]
public void MetodoInterno()
{
    // Método para uso interno apenas
}
``` 