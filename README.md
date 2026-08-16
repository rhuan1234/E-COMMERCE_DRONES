# Projeto Armas - Plataforma de Gerenciamento de Armamentos

[![Java](https://img.shields.io/badge/Java-25-ED8B00?style=flat-square&logo=java)](https://www.oracle.com/java/technologies/javase/jdk25-archive-downloads.html)
[![Quarkus](https://img.shields.io/badge/Quarkus-3.32.4-4695EB?style=flat-square&logo=quarkus)](https://quarkus.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Maven](https://img.shields.io/badge/Maven-3.8+-C71A36?style=flat-square&logo=apache-maven)](https://maven.apache.org/)
[![Licença](https://img.shields.io/badge/Licença-MIT-green?style=flat-square)](LICENSE)

## 📋 Descrição

Projeto **Armas** é uma plataforma de gerenciamento e e-commerce de armamentos desenvolvida com **Quarkus**, um framework Java ultrarrápido otimizado para containers. O sistema oferece funcionalidades completas de autenticação, gerenciamento de produtos, pedidos, pagamentos e fornecedores.

A aplicação utiliza arquitetura RESTful com JWT para autenticação, PostgreSQL para persistência de dados, e suporta migração para containers Docker com múltiplas opções de build.

## 📑 Tabela de Conteúdos

- [Características](#características)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Executar](#como-executar)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Endpoints Principais](#endpoints-principais)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Segurança](#segurança)
- [Testes](#testes)
- [Docker](#docker)
- [Contribuindo](#contribuindo)

## ✨ Características

- ✅ **Autenticação e Autorização**: Sistema de login com JWT e controle de acesso baseado em perfis
- ✅ **Gerenciamento de Produtos**: Armamentos, acessórios, miras e carregadores
- ✅ **Sistema de Pedidos**: Criação e rastreamento de pedidos com múltiplos status
- ✅ **Gerenciamento de Pagamentos**: Integração com sistema de pagamentos
- ✅ **Carrinho de Favoritos**: Usuários podem marcar produtos como favoritos
- ✅ **Gestão de Fornecedores**: Cadastro e gerenciamento de fornecedores
- ✅ **Sistema de Notificações**: Envio de e-mails via Mailtrap
- ✅ **Validação de Dados**: Utilizando Hibernate Validator
- ✅ **API REST Documentada**: OpenAPI/Swagger integrado
- ✅ **Segurança em Produção**: Suporte a build nativo GraalVM

## 🛠️ Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

| Ferramenta | Versão | Link |
|-----------|--------|------|
| **Java SDK** | 25+ | [Download](https://www.oracle.com/java/technologies/javase/jdk25-archive-downloads.html) |
| **Maven** | 3.8.1+ | [Download](https://maven.apache.org/download.cgi) |
| **PostgreSQL** | 12+ | [Download](https://www.postgresql.org/download/) |
| **Docker** (Opcional) | 20.10+ | [Download](https://www.docker.com/products/docker-desktop) |
| **Git** | Qualquer versão | [Download](https://git-scm.com/) |

### Validar Instalação

```bash
# Verificar Java
java -version

# Verificar Maven
mvn -version

# Verificar PostgreSQL
psql --version
```

## 📥 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/projeto-armas.git
cd projeto-armas
```

### 2. Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE topicos1db;

# Sair
\q
```

### 3. Instalar Dependências

```bash
# Compilar o projeto
mvn clean compile

# Instalar dependências
mvn install
```

## ⚙️ Configuração

### Arquivo de Configuração Principal

Edite o arquivo `src/main/resources/application.properties`:

```properties
# Banco de Dados
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=postgres
quarkus.datasource.password=123456
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/topicos1db

# Geração do Banco
quarkus.hibernate-orm.database.generation=drop-and-create
# Usar 'update' em produção

# Logging SQL
quarkus.hibernate-orm.log.sql=true
quarkus.hibernate-orm.log.bind-parameters=true

# JWT
mp.jwt.verify.publickey.location=META-INF/resources/publicKey.pem
mp.jwt.verify.issuer=armas-api
smallrye.jwt.sign.key.location=META-INF/resources/privateKey.pem
quarkus.http.auth.proactive=true

# Mailer (Email)
quarkus.mailer.host=sandbox.smtp.mailtrap.io
quarkus.mailer.port=2525
quarkus.mailer.start-tls=OPTIONAL
quarkus.mailer.username=SEU_USERNAME_MAILTRAP
quarkus.mailer.password=SEU_PASSWORD_MAILTRAP
quarkus.mailer.from=no-reply@armas.com
quarkus.mailer.mock=false
```

### Gerar Chaves JWT

```bash
# Gerar chave privada
openssl genrsa -out privateKey.pem 2048

# Gerar chave pública
openssl rsa -in privateKey.pem -pubout -out publicKey.pem

# Mover para o diretório de recursos
mkdir -p src/main/resources/META-INF/resources
cp privateKey.pem publicKey.pem src/main/resources/META-INF/resources/
```

## 🚀 Como Executar

### Modo Desenvolvimento

```bash
# Executar com hot-reload
./mvnw quarkus:dev
```

A aplicação estará disponível em: `http://localhost:8080`

### Modo Produção

```bash
# Build
./mvnw clean package

# Executar JAR
java -jar target/quarkus-app/quarkus-run.jar
```

### Build Nativo com GraalVM

```bash
# Build nativo (requer GraalVM)
./mvnw package -Pnative

# Executar
./target/projeto-armas-1.0.0-SNAPSHOT-runner
```

## 🏗️ Arquitetura do Projeto

O projeto segue o padrão **MVC (Model-View-Controller)** com separação clara de responsabilidades:

```
┌─────────────┐
│  REST API   │ ← Controllers (resources/)
└──────┬──────┘
       │
┌──────▼──────────┐
│   Services      │ ← Lógica de negócio
└──────┬──────────┘
       │
┌──────▼──────────┐
│  Repositories   │ ← Acesso a dados
└──────┬──────────┘
       │
┌──────▼──────────┐
│   Database      │ ← PostgreSQL
└─────────────────┘
```

### Camadas

| Camada | Responsabilidade | Localização |
|--------|-----------------|-------------|
| **Resources** | Expor endpoints REST | `src/main/java/armas/resources/` |
| **Services** | Implementar lógica de negócio | `src/main/java/armas/services/` |
| **Repositories** | Acesso a dados | `src/main/java/armas/repository/` |
| **Models** | Entidades do banco | `src/main/java/armas/model/` |
| **DTOs** | Transferência de dados | `src/main/java/armas/dto/` |
| **Mappers** | Conversão entre objetos | `src/main/java/armas/mapper/` |

## 📡 Endpoints Principais

### Autenticação

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "senha": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "tipo": "Bearer",
  "usuario": { ... }
}
```

### Gerenciamento de Usuários

```http
# Listar todos os usuários (ADMIN)
GET /usuarios/admin
Authorization: Bearer {token}

# Buscar usuário por ID
GET /usuarios/{id}

# Criar usuário
POST /usuarios
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "password123",
  "perfil": "CLIENTE"
}

# Atualizar usuário
PUT /usuarios/{id}

# Deletar usuário
DELETE /usuarios/{id}
```

### Produtos (Armamentos)

```http
# Listar fuzis
GET /fuzis

# Obter fuzil por ID
GET /fuzis/{id}

# Criar novo fuzil (ADMIN)
POST /fuzis

# Atualizar fuzil (ADMIN)
PUT /fuzis/{id}

# Deletar fuzil (ADMIN)
DELETE /fuzis/{id}
```

### Pedidos

```http
# Listar pedidos do usuário
GET /pedidos

# Obter pedido por ID
GET /pedidos/{id}

# Criar novo pedido
POST /pedidos

# Atualizar status do pedido
PATCH /pedidos/{id}/status
```

### Favoritos

```http
# Adicionar aos favoritos
POST /favoritos/{produtoId}

# Remover dos favoritos
DELETE /favoritos/{produtoId}

# Listar favoritos
GET /favoritos
```

Consulte a documentação interativa Swagger em: `http://localhost:8080/q/swagger-ui/`

## 📁 Estrutura de Diretórios

```
projeto-armas/
├── src/
│   ├── main/
│   │   ├── java/armas/
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   ├── armas/
│   │   │   │   ├── auth/
│   │   │   │   ├── fornecedores/
│   │   │   │   ├── mira/
│   │   │   │   ├── pedidos/
│   │   │   │   ├── registro/
│   │   │   │   └── usuarios/
│   │   │   ├── exception/                    # Tratamento de exceções
│   │   │   │   ├── ProblemDetail.java
│   │   │   │   ├── UnauthorizedException.java
│   │   │   │   ├── ValidationException.java
│   │   │   │   └── mapper/
│   │   │   ├── mapper/                       # Mapeadores DTO ↔ Model
│   │   │   ├── model/                        # Entidades JPA
│   │   │   │   ├── armas/
│   │   │   │   ├── fornecedor/
│   │   │   │   ├── mira/
│   │   │   │   ├── pedido/
│   │   │   │   └── usuario/
│   │   │   ├── repository/                   # Repositories (Panache)
│   │   │   ├── resources/                    # Controllers REST
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── CalibreController.java
│   │   │   │   ├── CarregadorController.java
│   │   │   │   ├── ClienteController.java
│   │   │   │   ├── FavoritoController.java
│   │   │   │   ├── FornecedorController.java
│   │   │   │   ├── FuzilController.java
│   │   │   │   ├── MiraHolograficaController.java
│   │   │   │   ├── PagamentoController.java
│   │   │   │   ├── PedidoController.java
│   │   │   │   └── RedDotController.java
│   │   │   └── services/                     # Serviços (Lógica de negócio)
│   │   ├── resources/
│   │   │   ├── application.properties        # Configuração principal
│   │   │   ├── diagram.plantuml              # Diagrama da arquitetura
│   │   │   ├── import.sql                    # Dados iniciais
│   │   │   └── META-INF/resources/
│   │   │       ├── publicKey.pem
│   │   │       └── privateKey.pem
│   │   └── docker/                           # Dockerfiles
│   │       ├── Dockerfile.jvm
│   │       ├── Dockerfile.legacy-jar
│   │       ├── Dockerfile.native
│   │       └── Dockerfile.native-micro
│   └── test/
│       └── java/armas/                       # Testes automatizados
│           ├── CalibreControllerTest.java
│           ├── CarregadorControllerTest.java
│           ├── FornecedorControllerTest.java
│           ├── FuzilControllerTest.java
│           ├── MiraHolograficaControllerTest.java
│           └── RedDotControllerTest.java
├── pom.xml                                   # Configuração Maven
├── mvnw                                      # Maven Wrapper (Linux/Mac)
├── mvnw.cmd                                  # Maven Wrapper (Windows)
├── README.md                                 # Este arquivo
└── target/                                   # Artifacts compilados
```

## 🛠️ Tecnologias Utilizadas

### Framework & Runtime
- **Quarkus 3.32.4** - Framework Java moderno e eficiente
- **Java 25** - Linguagem de programação
- **Maven** - Gerenciador de dependências e build

### Banco de Dados
- **PostgreSQL** - Banco de dados relacional
- **Hibernate ORM** - Mapeamento objeto-relacional
- **Hibernate Panache** - Simplificação do ORM
- **Hibernate Validator** - Validação de dados

### Segurança
- **SmallRye JWT** - Implementação de JWT
- **BCrypt (JBCrypt)** - Hash seguro de senhas

### Web & API
- **Quarkus REST** - Framework REST leve
- **Jackson** - Serialização JSON
- **SmallRye OpenAPI** - Documentação automática da API

### Email
- **Quarkus Mailer** - Envio de e-mails
- **Mailtrap** - Serviço de teste de email

### Testes
- **JUnit 5** - Framework de testes
- **Mockito** - Mock objects para testes
- **REST Assured** - Testes de API REST
- **Quarkus Test Security** - Testes de segurança

### DevOps
- **Docker** - Containerização
- **GraalVM** - Compilação nativa

## 🔒 Segurança

### Autenticação e Autorização

O projeto utiliza **JWT (JSON Web Tokens)** para autenticação e **Role-Based Access Control (RBAC)** para autorização:

```java
@RolesAllowed("ADMIN")
public Response buscarTodos() { ... }

@RolesAllowed({"ADMIN", "CLIENTE"})
public Response buscarPorId(@PathParam Long id) { ... }
```

### Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| **ADMIN** | Gerenciar produtos, usuários, pedidos e fornecedores |
| **CLIENTE** | Navegar produtos, criar pedidos, gerenciar favoritos |

### Senhas

As senhas são criptografadas usando **BCrypt**, fornecendo proteção contra ataques de força bruta.

### CORS

Configurar CORS conforme necessário em `application.properties`:

```properties
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:3000
```

## 🧪 Testes

### Executar Todos os Testes

```bash
mvn test
```

### Executar Teste Específico

```bash
mvn test -Dtest=CalibreControllerTest
```

### Relatório de Cobertura

```bash
mvn jacoco:report
# Visualizar em: target/site/jacoco/index.html
```

### Testes Inclusos

- `CalibreControllerTest.java` - Testes do controlador de calibres
- `CarregadorControllerTest.java` - Testes do controlador de carregadores
- `FornecedorControllerTest.java` - Testes do controlador de fornecedores
- `FuzilControllerTest.java` - Testes do controlador de fuzis
- `MiraHolograficaControllerTest.java` - Testes do controlador de miras
- `RedDotControllerTest.java` - Testes do controlador de red dots

## 🐳 Docker

### Build com Docker

#### JVM Standard
```bash
# Build
docker build -f src/main/docker/Dockerfile.jvm -t armas-api:jvm .

# Executar
docker run -p 8080:8080 -e QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://host.docker.internal:5432/topicos1db armas-api:jvm
```

#### JVM Otimizado
```bash
docker build -f src/main/docker/Dockerfile.legacy-jar -t armas-api:legacy .
docker run -p 8080:8080 armas-api:legacy
```

#### Nativo
```bash
# Requer GraalVM
docker build -f src/main/docker/Dockerfile.native -t armas-api:native .
docker run -p 8080:8080 armas-api:native
```

#### Nativo Micro
```bash
docker build -f src/main/docker/Dockerfile.native-micro -t armas-api:native-micro .
docker run -p 8080:8080 armas-api:native-micro
```

### Docker Compose (Recomendado)

Crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: topicos1db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 123456
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .
      dockerfile: src/main/docker/Dockerfile.jvm
    ports:
      - "8080:8080"
    environment:
      QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://postgres:5432/topicos1db
    depends_on:
      - postgres

volumes:
  postgres_data:
```

```bash
# Iniciar serviços
docker-compose up

# Parar serviços
docker-compose down
```

## 📚 Documentação Adicional

- [Documentação Quarkus](https://quarkus.io/guides/)
- [Documentação Hibernate](https://hibernate.org/orm/documentation/)
- [Guia JWT](https://tools.ietf.org/html/rfc7519)
- [REST Best Practices](https://restfulapi.net/)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📋 Checklist para Desenvolvimento

- [ ] Seguir padrão de nomenclatura Java
- [ ] Adicionar testes para novas features
- [ ] Documentar mudanças significativas
- [ ] Executar `mvn clean package` antes de fazer push
- [ ] Manter compatibilidade com versão Java 25+

## 🐛 Troubleshooting

### Erro de Conexão ao PostgreSQL

```
org.postgresql.util.PSQLException: Connection to localhost:5432 refused
```

**Solução:**
- Verifique se PostgreSQL está em execução
- Valide credentials em `application.properties`
- Verifique se o banco de dados foi criado

### Erro de Chaves JWT

```
java.nio.file.NoFileFoundException: META-INF/resources/privateKey.pem
```

**Solução:**
- Regenere as chaves JWT seguindo a seção [Configuração](#configuração)

### Porta 8080 já em uso

```
Address already in use: bind
```

**Solução:**
```bash
# Mudar porta em application.properties
quarkus.http.port=8081

# Ou matar processo usando a porta
lsof -i :8080
kill -9 <PID>
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## ✉️ Contato

**Autor:** Rhuan Honorato  
**Email:** seu-email@example.com  
**GitHub:** [@seu-usuario](https://github.com/seu-usuario)

---

**Última atualização:** 16 de Agosto de 2026  
**Versão:** 1.0.0-SNAPSHOT