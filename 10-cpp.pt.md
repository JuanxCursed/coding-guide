# C++: Guia de Melhores Práticas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](10-cpp.md)
> - [Português](10-cpp.pt.md)

## Estilo C++ Moderno

```cpp
// Use nomes descritivos para variáveis
int contadorUsuarios = 42;  // Bom
int cu = 42;  // Ruim

// Use auto para tipos complexos
auto iterador = meuMapa.find(chave);  // Bom
std::map<std::string, std::vector<int>>::iterator iterador = meuMapa.find(chave);  // Verboso

// Use nullptr em vez de NULL ou 0
void* ptr = nullptr;  // Bom
void* ptr = NULL;  // Desatualizado
void* ptr = 0;  // Confuso

// Use loops baseados em intervalo
for (const auto& item : container) {  // Bom
    // Use item
}

// Evite isso quando possível
for (auto it = container.begin(); it != container.end(); ++it) {  // Mais verboso
    // Use *it
}

// Use inicialização por lista
std::vector<int> v = {1, 2, 3, 4};  // Bom
std::pair<int, std::string> p = {1, "um"};  // Bom

// Use enum class em vez de enum
enum class Cor { Vermelho, Verde, Azul };  // Bom, fortemente tipado
enum CorAntiga { Vermelho, Verde, Azul };  // Ruim, polui o namespace
```

## Melhores Práticas C++

### 1. Gerenciamento de Recursos

```cpp
// Use RAII (Resource Acquisition Is Initialization)
// Deixe os destrutores lidarem com a limpeza

// Ruim
void funcaoRuim() {
    int* dados = new int[1000];
    // Se ocorrer uma exceção aqui, há vazamento de memória
    delete[] dados;
}

// Bom
void funcaoBoa() {
    // Vector gerencia a memória automaticamente
    std::vector<int> dados(1000);
    // Não é necessário se preocupar com a deleção
}

// Use ponteiros inteligentes, não ponteiros brutos para propriedade
// std::unique_ptr para propriedade exclusiva
std::unique_ptr<Recurso> criarRecurso() {
    return std::make_unique<Recurso>();
}

// std::shared_ptr para propriedade compartilhada
void processarRecurso(std::shared_ptr<Recurso> recurso) {
    // Múltiplas referências podem existir
}

// Passe por referência para evitar cópia
void processarObjetoGrande(const ObjetoGrande& obj) {  // Bom
    // Use obj
}

void processarObjetoGrande(ObjetoGrande obj) {  // Ruim, faz cópia
    // Use obj
}

// Use std::optional para valores opcionais (C++17)
std::optional<std::string> encontrarNomeUsuario(int id) {
    if (usuarioExiste(id))
        return nomeUsuario(id);
    return std::nullopt;
}
```

### 2. Gerenciamento Moderno de Memória

```cpp
// Prefira containers a arrays brutos
std::vector<int> valores = {1, 2, 3, 4};  // Bom

// Evite gerenciamento manual de memória quando possível
// Ruim
int* valores = new int[4]{1, 2, 3, 4};
// ... use valores
delete[] valores;

// Use make_unique e make_shared
auto recurso = std::make_unique<Recurso>();  // Bom
std::unique_ptr<Recurso> recurso(new Recurso());  // Menos bom

// Use std::string, não arrays de char
std::string nome = "João Silva";  // Bom
char nome[64] = "João Silva";  // Ruim

// Use std::array para arrays de tamanho fixo
std::array<int, 4> valores = {1, 2, 3, 4};  // Bom, tamanho fixo com verificação de limites

// Use std::string_view para visualizações não proprietárias (C++17)
void processarNome(std::string_view nome) {
    // Evita copiar strings
}
```

### 3. Lógica Condicional Clara

```cpp
// Ruim - condição complexa diretamente no if
if (usuario.idade >= 18 && usuario.estaVerificado && !usuario.estaBanido && usuario.assinatura.estaAtiva) {
    permitirAcesso();
}

// Bom - usando variáveis descritivas para explicar as condições
bool ehAdulto = usuario.idade >= 18;
bool estaVerificado = usuario.estaVerificado;
bool naoEstaBanido = !usuario.estaBanido;
bool temAssinaturaAtiva = usuario.assinatura.estaAtiva;

if (ehAdulto && estaVerificado && naoEstaBanido && temAssinaturaAtiva) {
    permitirAcesso();
}

// Ainda melhor - envolva condições complexas em funções com nomes descritivos
bool podeAcessarConteudo(const Usuario& usuario) {
    bool ehAdulto = usuario.idade >= 18;
    bool estaVerificado = usuario.estaVerificado;
    bool naoEstaBanido = !usuario.estaBanido;
    bool temAssinaturaAtiva = usuario.assinatura.estaAtiva;
    
    return ehAdulto && estaVerificado && naoEstaBanido && temAssinaturaAtiva;
}

if (podeAcessarConteudo(usuario)) {
    permitirAcesso();
}

// Usando constantes para condições de limite
// Ruim - números mágicos
if (temperatura > 30) {
    mostrarAvisoCalor();
}

// Bom - constantes nomeadas
constexpr double LIMITE_TEMPERATURA_ALTA = 30.0;

if (temperatura > LIMITE_TEMPERATURA_ALTA) {
    mostrarAvisoCalor();
}

// Usando switch com enums significativos
enum class StatusPedido { Pendente, Processando, Enviado, Entregue, Cancelado };

void processarPedido(const Pedido& pedido) {
    switch (pedido.status) {
        case StatusPedido::Pendente:
            // Trata pedido pendente
            break;
        case StatusPedido::Processando:
            // Trata pedido em processamento
            break;
        case StatusPedido::Enviado:
            // Trata pedido enviado
            break;
        case StatusPedido::Entregue:
            // Trata pedido entregue
            break;
        case StatusPedido::Cancelado:
            // Trata pedido cancelado
            break;
    }
}
```

### 4. Tratamento de Erros

```cpp
// Use exceções para condições excepcionais
// Não para fluxo normal de controle
void processarArquivo(const std::string& caminho) {
    std::ifstream arquivo(caminho);
    if (!arquivo) {
        throw std::runtime_error("Falha ao abrir arquivo: " + caminho);
    }
    // Processa arquivo
}

// Use blocos try/catch para tratar exceções
void chamadaFuncaoSegura() {
    try {
        processarArquivo("dados.txt");
    } catch (const std::exception& e) {
        std::cerr << "Erro: " << e.what() << std::endl;
        // Trata erro
    }
}

// Considere usar std::expected ou std::outcome (C++23 ou bibliotecas)
// para falhas esperadas

// Use [[nodiscard]] para funções cujos valores de retorno não devem ser ignorados
[[nodiscard]] bool salvarDados() {
    // Retorna true se bem-sucedido
    return true;
}

// O chamador é encorajado a usar o valor de retorno
if (!salvarDados()) {
    // Trata falha
}
```

### 5. Considerações de Performance

```cpp
// Use reserve para vectors quando o tamanho é conhecido
std::vector<int> valores;
valores.reserve(1000);  // Evita múltiplas realocações

// Passe objetos grandes por referência constante para evitar cópia
void processarDados(const ObjetoGrande& dados) {
    // Usa dados sem copiar
}

// Use emplace em vez de push_back ao construir elementos no local
std::vector<std::pair<int, std::string>> pares;
pares.emplace_back(1, "um");  // Bom
pares.push_back(std::make_pair(2, "dois"));  // Menos eficiente

// Use semântica de movimento para transferir propriedade
std::unique_ptr<Recurso> criarRecurso() {
    auto recurso = std::make_unique<Recurso>();
    // Configura recurso
    return recurso;  // Movido automaticamente
}

// Esteja ciente da Otimização de Valor de Retorno (RVO)
ObjetoGrande criarObjetoGrande() {
    ObjetoGrande obj;
    // Configura obj
    return obj;  // Compilador pode otimizar a cópia
}
```

### 6. Testes

```cpp
// Use um framework de testes como Google Test ou Catch2
TEST_CASE("Calculadora") {
    Calculadora calc;
    
    SECTION("Soma") {
        REQUIRE(calc.somar(2, 2) == 4);
        REQUIRE(calc.somar(-1, 1) == 0);
    }
    
    SECTION("Divisão") {
        REQUIRE(calc.dividir(6, 2) == 3);
        REQUIRE_THROWS(calc.dividir(1, 0));
    }
}

// Use mocks quando necessário
class MockBancoDados : public IBancoDados {
public:
    MOCK_METHOD(bool, conectar, (), (override));
    MOCK_METHOD(void, desconectar, (), (override));
    MOCK_METHOD(Dados, consultar, (const std::string&), (override));
};

TEST_F(TesteBancoDados, ConexaoBemSucedida) {
    MockBancoDados mockDB;
    EXPECT_CALL(mockDB, conectar())
        .WillOnce(Return(true));
        
    ServicoUsuario servico(&mockDB);
    ASSERT_TRUE(servico.inicializar());
}
```

### 7. Documentação

```cpp
/// @brief Processa um pedido e retorna o resultado do processamento
/// @param pedido O pedido a ser processado
/// @param opcoes Opções de processamento opcionais
/// @return O resultado do processamento do pedido
/// @throws PedidoInvalidoException quando o pedido não atende aos requisitos mínimos
ResultadoPedido processarPedido(
    const Pedido& pedido,
    const OpcoesPedido& opcoes = OpcoesPedido()
) {
    // Implementação
}

// Use atributos para documentar comportamentos especiais
[[deprecated("Use processarPedidoV2 em vez deste método")]]
void processarPedido(Pedido* pedido) {
    // Implementação antiga
}

[[nodiscard]] bool salvarAlteracoes() {
    // Retorna true se as alterações foram salvas com sucesso
    return true;
}
``` 