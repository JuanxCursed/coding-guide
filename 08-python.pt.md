# Python: Guia de Melhores Práticas

> [!NOTE] 
> 🌐 Language/Idioma
> - [English](08-python.md)
> - [Português](08-python.pt.md)

## Estilo de Código

```python
# Use nomes descritivos para variáveis
user_count = 42  # Bom
uc = 42  # Ruim

# Prefira list comprehensions em vez de loops para casos simples
squares = [x * x for x in range(10)]  # Bom
squares = []
for x in range(10):  # Menos eficiente
    squares.append(x * x)

# Use f-strings para interpolação de strings
name = "Alice"
age = 30
message = f"Olá, {name}! Você tem {age} anos."  # Bom
message = "Olá, " + name + "! Você tem " + str(age) + " anos."  # Ruim

# Use comparações explícitas
if count == 0:  # Bom
    print("Vazio")
    
if not user_list:  # Bom para verificar coleções vazias
    print("Sem usuários")
```

## Melhores Práticas Python

### 1. Legibilidade em Primeiro Lugar

```python
# Use nomes bem definidos para variáveis e funções
def calcular_media_pontuacao(pontuacoes):
    """Calcula a média de uma lista de pontuações."""
    if not pontuacoes:
        return 0
    return sum(pontuacoes) / len(pontuacoes)

# Adicione docstrings a funções, classes e módulos
def obter_usuario_por_id(user_id):
    """
    Recupera um usuário pelo seu ID.
    
    Args:
        user_id (int): O ID do usuário a ser recuperado.
        
    Returns:
        dict: Informações do usuário ou None se não encontrado.
    """
    # Implementação
    pass

# Evite aninhamento profundo
# Ruim:
def processar_dados(dados):
    if dados:
        if 'usuario' in dados:
            if 'preferencias' in dados['usuario']:
                if 'tema' in dados['usuario']['preferencias']:
                    return dados['usuario']['preferencias']['tema']
    return 'padrao'

# Bom:
def processar_dados(dados):
    if not dados:
        return 'padrao'
    
    usuario = dados.get('usuario', {})
    preferencias = usuario.get('preferencias', {})
    return preferencias.get('tema', 'padrao')
```

### 2. Comparações e Condicionais Adequados

```python
# Use is para None, True, False
if usuario is None:  # Bom
    print("Sem usuário")
    
if valor is True:  # Bom
    print("Explicitamente True")
    
# Use == para igualdade de valor
if contagem == 0:  # Bom
    print("Vazio")
    
# Use in para verificar pertencimento em coleções
if user_id in usuarios_ativos:  # Bom
    print("Usuário está ativo")
    
# Evite comparações redundantes
# Ruim:
if esta_ativo == True:
    processar_usuario_ativo()
    
# Bom:
if esta_ativo:
    processar_usuario_ativo()
    
# Use all() e any() para múltiplas condições
if all(pontuacao > 70 for pontuacao in pontuacoes):
    print("Todas as pontuações estão acima de 70")
    
if any(usuario.is_admin for usuario in usuarios):
    print("Existe pelo menos um usuário admin")

# Usando variáveis descritivas para condições complexas
# Ruim - condição complexa diretamente no if
if usuario.idade >= 18 and usuario.esta_verificado and not usuario.esta_banido and usuario.assinatura.status == 'ativa':
    permitir_acesso()

# Bom - usando variáveis descritivas para explicar as condições
eh_adulto = usuario.idade >= 18
esta_verificado = usuario.esta_verificado
nao_esta_banido = not usuario.esta_banido
tem_assinatura_ativa = usuario.assinatura.status == 'ativa'

if eh_adulto and esta_verificado and nao_esta_banido and tem_assinatura_ativa:
    permitir_acesso()

# Ainda melhor - envolva condições complexas em funções com nomes descritivos
def pode_acessar_conteudo(usuario):
    """Verifica se o usuário pode acessar conteúdo premium."""
    eh_adulto = usuario.idade >= 18
    esta_verificado = usuario.esta_verificado
    nao_esta_banido = not usuario.esta_banido
    tem_assinatura_ativa = usuario.assinatura.status == 'ativa'
    
    return eh_adulto and esta_verificado and nao_esta_banido and tem_assinatura_ativa

if pode_acessar_conteudo(usuario):
    permitir_acesso()

# Usando variáveis para condições de limite
# Ruim - números mágicos
if temperatura > 30:
    mostrar_aviso_calor()

# Bom - constantes nomeadas
LIMITE_TEMPERATURA_ALTA = 30

if temperatura > LIMITE_TEMPERATURA_ALTA:
    mostrar_aviso_calor()

# Usando variáveis para clareza na lógica de negócio
# Ruim - comparação de preço pouco clara
if preco * quantidade < 100:
    aplicar_desconto()

# Bom - lógica de negócio clara
total_pedido = preco * quantidade
LIMITE_DESCONTO = 100
elegivel_para_desconto = total_pedido < LIMITE_DESCONTO

if elegivel_para_desconto:
    aplicar_desconto()

# Para comparações de data/hora
# Ruim - cálculo de tempo obscuro
import time
if time.time() - usuario.timestamp_ultimo_login > 60 * 60 * 24 * 30:
    solicitar_novo_login()

# Bom - variáveis de tempo claras
TRINTA_DIAS_EM_SEGUNDOS = 60 * 60 * 24 * 30
tempo_desde_ultimo_login = time.time() - usuario.timestamp_ultimo_login
login_expirado = tempo_desde_ultimo_login > TRINTA_DIAS_EM_SEGUNDOS

if login_expirado:
    solicitar_novo_login()

# Usando variáveis para regex ou correspondência de padrões complexos
import re

# Ruim - regex complexo diretamente no if
if re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
    enviar_email_verificacao(email)

# Bom - padrão nomeado com explicação
PADRAO_EMAIL = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
email_valido = re.match(PADRAO_EMAIL, email) is not None

if email_valido:
    enviar_email_verificacao(email)
```

### 3. Trabalhando com Coleções

```python
# Use list comprehensions para transformações simples
nomes_maiusculos = [nome.upper() for nome in nomes]

# Use dictionary comprehensions
nome_para_idade = {usuario.nome: usuario.idade for usuario in usuarios}

# Use expressões geradoras para grandes conjuntos de dados
soma_dos_quadrados = sum(x * x for x in range(1000000))

# Prefira defaultdict para lidar com valores padrão
from collections import defaultdict
pontuacoes_usuario = defaultdict(list)
for nome, pontuacao in dados_pontuacoes:
    pontuacoes_usuario[nome].append(pontuacao)

# Use Counter para contagem
from collections import Counter
contagem_palavras = Counter(documento.split())
mais_comuns = contagem_palavras.most_common(10)

# Use sets para teste de pertencimento e remoção de duplicatas
tags_unicas = set(todas_tags)
if tag in tags_unicas:
    print("Tag existe")
```

### 4. Tratamento de Erros

```python
# Use exceções específicas
try:
    usuario = obter_usuario(user_id)
except UsuarioNaoEncontradoError:
    # Trata erro específico
    criar_usuario(user_id)
except ErroBaseDados:
    # Trata erro diferente
    registrar_erro("Erro na base de dados")
finally:
    # Sempre executado
    fechar_conexao()

# Gerenciadores de contexto para gerenciamento de recursos
with open('dados.txt', 'r') as arquivo:
    conteudo = arquivo.read()
# Arquivo automaticamente fechado

# Gerenciadores de contexto personalizados
from contextlib import contextmanager

@contextmanager
def conexao_banco_dados():
    conexao = criar_conexao()
    try:
        yield conexao
    finally:
        conexao.close()
```

### 5. Funções e Métodos

```python
# Use argumentos nomeados para clareza
def criar_usuario(
    nome: str,
    email: str,
    idade: int = None,
    is_admin: bool = False
) -> Usuario:
    return Usuario(
        nome=nome,
        email=email,
        idade=idade,
        is_admin=is_admin
    )

# Use type hints para melhor documentação e suporte IDE
def calcular_media(numeros: list[float]) -> float:
    if not numeros:
        return 0.0
    return sum(numeros) / len(numeros)

# Use valores padrão imutáveis
def processar_lista(items: list, processados: set = None) -> set:
    if processados is None:
        processados = set()
    # Processamento
    return processados

# Use *args e **kwargs quando apropriado
def registrar(*args, nivel: str = 'INFO', **kwargs):
    mensagem = ' '.join(str(arg) for arg in args)
    extras = ', '.join(f'{k}={v}' for k, v in kwargs.items())
    print(f'[{nivel}] {mensagem} {extras}')
```

### 6. Classes e Orientação a Objetos

```python
# Use classes para encapsular dados relacionados
class Usuario:
    def __init__(self, nome: str, email: str):
        self.nome = nome
        self.email = email
        self._pontos = 0  # Atributo protegido
        
    @property
    def pontos(self) -> int:
        return self._pontos
    
    def adicionar_pontos(self, valor: int) -> None:
        if valor > 0:
            self._pontos += valor

# Use herança quando apropriado
class UsuarioAdmin(Usuario):
    def __init__(self, nome: str, email: str):
        super().__init__(nome, email)
        self.is_admin = True
    
    def resetar_pontos(self) -> None:
        self._pontos = 0

# Use dataclasses para classes de dados simples
from dataclasses import dataclass

@dataclass
class Configuracao:
    host: str
    porta: int
    debug: bool = False
```

### 7. Testes

```python
# Use pytest para testes
import pytest
from typing import List

def test_calcular_media():
    # Arrange
    numeros = [1, 2, 3, 4, 5]
    
    # Act
    resultado = calcular_media(numeros)
    
    # Assert
    assert resultado == 3.0

# Use fixtures para configuração de teste
@pytest.fixture
def usuario_teste():
    return Usuario(
        nome="Teste",
        email="teste@exemplo.com"
    )

def test_adicionar_pontos(usuario_teste):
    # Arrange
    pontos_iniciais = usuario_teste.pontos
    
    # Act
    usuario_teste.adicionar_pontos(10)
    
    # Assert
    assert usuario_teste.pontos == pontos_iniciais + 10

# Use parametrize para múltiplos casos de teste
@pytest.mark.parametrize("entrada,esperado", [
    ([1, 2, 3], 2.0),
    ([0], 0.0),
    ([], 0.0),
])
def test_calcular_media_parametrizado(
    entrada: List[float],
    esperado: float
):
    assert calcular_media(entrada) == esperado
```

### 8. Documentação

```python
# Use docstrings informativas
def validar_email(email: str) -> bool:
    """
    Valida um endereço de email.
    
    Args:
        email (str): O endereço de email a ser validado.
        
    Returns:
        bool: True se o email é válido, False caso contrário.
        
    Examples:
        >>> validar_email("usuario@exemplo.com")
        True
        >>> validar_email("invalido")
        False
    """
    # Implementação
    pass

# Use type hints com documentação
from typing import Optional, Dict, Any

def obter_configuracao(
    chave: str,
    padrao: Any = None
) -> Optional[Dict[str, Any]]:
    """
    Recupera configuração do sistema.
    
    Args:
        chave: Identificador da configuração.
        padrao: Valor padrão se a configuração não existir.
        
    Returns:
        Dicionário com a configuração ou None se não encontrada.
    
    Raises:
        ConfigError: Se houver erro ao acessar as configurações.
    """
    # Implementação
    pass
``` 