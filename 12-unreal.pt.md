# Unreal Engine: Guia de Melhores Práticas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](12-unreal.md)
> - [Português](12-unreal.pt.md)

## Padrões de Codificação C++

```cpp
// Use convenções de nomenclatura adequadas
class MEUJOGO_API APersonagemMeuJogo : public ACharacter // Classes com prefixo A para Actors
{
    GENERATED_BODY() // Sempre inclua a macro GENERATED_BODY
    
public:
    // Construtor
    APersonagemMeuJogo();
    
    // Funções de sobrescrita usam a palavra-chave override
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    
    // Use UPROPERTY para expor ao Blueprint com categoria apropriada
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Personagem")
    float VelocidadeMovimento = 600.0f;
    
    // Use VisibleAnywhere para componentes criados em C++
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Componentes")
    USpringArmComponent* BracoCamara;
    
    // Use UFUNCTION para exposição ao Blueprint
    UFUNCTION(BlueprintCallable, Category = "Personagem")
    void AplicarDano(float QuantidadeDano);
    
    // Eventos implementáveis em Blueprint
    UFUNCTION(BlueprintImplementableEvent, Category = "Personagem")
    void AoReceberDano(float QuantidadeDano);
    
    // Eventos nativos do Blueprint (base C++ com sobrescrita opcional em Blueprint)
    UFUNCTION(BlueprintNativeEvent, Category = "Personagem")
    void AoMudarVida(float NovaVida);
    void AoMudarVida_Implementation(float NovaVida);
    
private:
    // Variáveis privadas usam prefixo m
    float mVida = 100.0f;
    
    // Função privada com nome claro
    void AtualizarStatusPersonagem();
};
```

## Lógica Condicional Clara no Unreal

```cpp
// Ruim - condição complexa diretamente no if
if (Personagem->ObterVida() > 0 && !Personagem->EstaAtordoado() && 
    Personagem->ObterStamina() > 10 && !UGameplayStatics::IsGamePaused(GetWorld()) && 
    Controlador && Controlador->IsInputKeyDown(EKeys::LeftMouseButton))
{
    ExecutarAtaque();
}

// Bom - usando variáveis descritivas para explicar as condições
bool bEstaVivo = Personagem->ObterVida() > 0;
bool bNaoEstaAtordoado = !Personagem->EstaAtordoado();
bool bTemStaminaSuficiente = Personagem->ObterStamina() > 10;
bool bJogoEstaAtivo = !UGameplayStatics::IsGamePaused(GetWorld());
bool bBotaoAtaquePrecionado = Controlador && Controlador->IsInputKeyDown(EKeys::LeftMouseButton);

bool bPodeExecutarAtaque = bEstaVivo && bNaoEstaAtordoado && bTemStaminaSuficiente && bJogoEstaAtivo;

if (bPodeExecutarAtaque && bBotaoAtaquePrecionado)
{
    ExecutarAtaque();
}

// Ainda melhor - envolva condições complexas em funções com nomes descritivos
bool PersonagemPodeAtacar() const
{
    bool bEstaVivo = Personagem->ObterVida() > 0;
    bool bNaoEstaAtordoado = !Personagem->EstaAtordoado();
    bool bTemStaminaSuficiente = Personagem->ObterStamina() > 10;
    bool bJogoEstaAtivo = !UGameplayStatics::IsGamePaused(GetWorld());
    
    return bEstaVivo && bNaoEstaAtordoado && bTemStaminaSuficiente && bJogoEstaAtivo;
}

void Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    
    if (PersonagemPodeAtacar() && Controlador && Controlador->IsInputKeyDown(EKeys::LeftMouseButton))
    {
        ExecutarAtaque();
    }
}

// Usando constantes para valores de design do jogo
// Ruim - números mágicos
if (FVector::Dist(GetActorLocation(), LocalizacaoAlvo) < 300.0f)
{
    AtivarColeta();
}

// Bom - constantes nomeadas
const float ALCANCE_COLETA = 300.0f;

if (FVector::Dist(GetActorLocation(), LocalizacaoAlvo) < ALCANCE_COLETA)
{
    AtivarColeta();
}

// Melhor - use valores de configuração
// No header:
UPROPERTY(EditDefaultsOnly, Category = "Interação")
float AlcanceColeta = 300.0f;

// Na implementação:
if (FVector::Dist(GetActorLocation(), LocalizacaoAlvo) < AlcanceColeta)
{
    AtivarColeta();
}
```

## Melhores Práticas de Blueprint

### 1. Organização de Blueprint

1. **Comente Seus Blueprints**
   - Adicione comentários a grupos de nós explicando seu propósito
   - Use caixas de comentário para organizar seções lógicas

2. **Use Funções e Macros**
   - Divida lógica complexa em funções
   - Crie macros reutilizáveis para padrões repetidos
   - Organize por funcionalidade

3. **Comunicação entre Blueprints**
   - Prefira despachantes de eventos a referências diretas
   - Use interfaces para comunicação entre blueprints
   - Implemente tags de gameplay para interações flexíveis

### 2. Eficiência em Blueprint

1. **Minimize o Uso do Event Tick**
   - Evite computação pesada no Event Tick
   - Use timers ou funções de tick personalizadas com intervalos mais longos quando possível

2. **Operações com Arrays**
   - Minimize operações "Get" dentro de loops
   - Use "for each loop with break" para condições de saída antecipada

3. **Uso de Variáveis**
   - Cache valores acessados frequentemente
   - Use variáveis locais para cálculos
   - Defina escopo apropriado de variáveis (instância vs. local)

### 3. Lógica Clara de Blueprint com Variáveis

1. **Crie variáveis descritivas para condições**
   - Crie variáveis booleanas com nomes descritivos para condições complexas
   - Combine condições usando operações AND/OR para legibilidade
   - Use nós Branch com nomes claros de variáveis

2. **Exemplo de função Blueprint para condicionais limpos**
   ```
   Função: PersonagemPodeAtacar
   Entrada: Nenhuma
   Saída: Booleano
   
   Passos:
   1. Criar booleano local: EstaVivo = Vida > 0
   2. Criar booleano local: NaoEstaAtordoado = NÃO EstaAtordoado
   3. Criar booleano local: TemStaminaSuficiente = Stamina > 10
   4. Criar booleano local: JogoEstaAtivo = NÃO JogoEstaPausado
   5. Retornar: EstaVivo E NaoEstaAtordoado E TemStaminaSuficiente E JogoEstaAtivo
   ```

## Design Baseado em Componentes

```cpp
// Personagem com design baseado em componentes
UCLASS()
class MEUJOGO_API APersonagemModular : public ACharacter
{
    GENERATED_BODY()
    
public:
    APersonagemModular();
    
    // Componente de vida
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Componentes")
    UComponenteVida* ComponenteVida;
    
    // Componente de inventário
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Componentes")
    UComponenteInventario* ComponenteInventario;
    
    // Componente de habilidade
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Componentes")
    UComponenteHabilidade* ComponenteHabilidade;
    
    // Em vez de implementar toda a funcionalidade na classe do personagem,
    // delegue para componentes especializados
};

// Implementação do componente de vida
UCLASS()
class MEUJOGO_API UComponenteVida : public UActorComponent
{
    GENERATED_BODY()
    
public:
    UComponenteVida();
    
    virtual void BeginPlay() override;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vida")
    float VidaMaxima = 100.0f;
    
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Vida")
    float VidaAtual = 100.0f;
    
    UFUNCTION(BlueprintCallable, Category = "Vida")
    void AplicarDano(float QuantidadeDano, AActor* CausadorDano);
    
    UFUNCTION(BlueprintCallable, Category = "Vida")
    void Curar(float QuantidadeCura);
    
    // Delegados para transmissão de eventos
    DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FAssinaturaVidaMudou, float, VidaAtual, float, VidaMaxima);
    UPROPERTY(BlueprintAssignable, Category = "Eventos")
    FAssinaturaVidaMudou AoMudarVida;
    
    DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FAssinaturaMorte, AActor*, Assassino);
    UPROPERTY(BlueprintAssignable, Category = "Eventos")
    FAssinaturaMorte AoMorrer;
    
protected:
    void TransmitirMudancaVida();
};
```

## Design Orientado a Dados com Data Assets

```cpp
// Data asset de item
UCLASS()
class MEUJOGO_API UDadosItem : public UPrimaryDataAsset
{
    GENERATED_BODY()
    
public:
    // Informações básicas do item
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    FText Nome;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    FText Descricao;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Item")
    UTexture2D* Icone;
    
    // Estatísticas do item
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Estatísticas")
    float Dano;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Estatísticas")
    float Durabilidade;
    
    // Efeitos do item
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Efeitos")
    TArray<TSubclassOf<UGameplayEffect>> EfeitosAoUsar;
};

// Gerenciador de dados do jogo
UCLASS()
class MEUJOGO_API UGerenciadorDados : public UGameInstanceSubsystem
{
    GENERATED_BODY()
    
public:
    // Carrega todos os data assets necessários
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;
    
    // Obtém item por ID
    UFUNCTION(BlueprintCallable, Category = "Dados")
    UDadosItem* ObterDadosItem(const FName& ID) const;
    
private:
    // Cache de data assets
    UPROPERTY()
    TMap<FName, UDadosItem*> CacheItens;
};
``` 