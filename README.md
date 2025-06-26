# CashTab Backend

Backend da aplicação CashTab - Sistema de Controle Financeiro Pessoal desenvolvido com NestJS e MongoDB.

## 📋 Descrição

O CashTab Backend é uma API RESTful desenvolvida em NestJS que fornece funcionalidades completas para controle financeiro pessoal, incluindo gestão de receitas, despesas, usuários e relatórios financeiros.

## 🚀 Tecnologias Utilizadas

- **NestJS** - Framework Node.js para construção de aplicações escaláveis
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Passport.js** - Autenticação e autorização
- **JWT** - Tokens de autenticação
- **bcryptjs** - Criptografia de senhas
- **class-validator** - Validação de dados
- **ExcelJS** - Geração de relatórios em Excel
- **TypeScript** - Linguagem de programação

## 📁 Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── guards/          # Guards de autenticação
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── user/                # Módulo de usuários
│   ├── dto/            # Data Transfer Objects
│   ├── schemas/        # Schemas MongoDB
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── user.service.ts
├── expense/            # Módulo de despesas
│   ├── dto/
│   ├── schemas/
│   ├── expense.controller.ts
│   ├── expense.module.ts
│   └── expense.service.ts
├── income/             # Módulo de receitas
│   ├── dto/
│   ├── schemas/
│   ├── income.controller.ts
│   ├── income.module.ts
│   └── income.service.ts
├── report/             # Módulo de relatórios
│   ├── interfaces/
│   ├── report.controller.ts
│   ├── report.module.ts
│   └── report.service.ts
├── scripts/            # Scripts utilitários
│   └── populate-database.ts
├── app.module.ts       # Módulo principal
└── main.ts            # Arquivo de inicialização
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (versão 4.4 ou superior)
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd cashtab-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb://localhost:27017/cashtab
JWT_SECRET=sua-chave-secreta-jwt
PORT=3001
```

### 4. Execute o projeto

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

## 📊 Banco de Dados

### Schemas MongoDB

#### User Schema
```typescript
{
  username: string (required)
  email: string (required)
  password: string (required)
  expenses: string[] (array de IDs de despesas)
  incomes: string[] (array de IDs de receitas)
  createdAt: Date
  updatedAt: Date
  lastLogin: Date
}
```

#### Expense Schema
```typescript
{
  description: string (required)
  amount: number (required, min: 0)
  date: Date (required)
  userId: string (required)
  category?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Income Schema
```typescript
{
  description: string (required)
  amount: number (required)
  date: Date (required)
  userId: ObjectId (required)
  category?: string
  image?: string
  createdAt: Date
  updatedAt: Date
}
```

## 🔐 Autenticação

O sistema utiliza autenticação JWT com as seguintes funcionalidades:

- **Registro de usuários** - POST `/api/auth/register`
- **Login** - POST `/api/auth/login`
- **Proteção de rotas** - Guards JWT
- **Validação de dados** - DTOs com class-validator

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Despesas
- `GET /api/expenses` - Listar despesas
- `GET /api/expenses/:id` - Buscar despesa por ID
- `POST /api/expenses` - Criar nova despesa
- `PUT /api/expenses/:id` - Atualizar despesa
- `DELETE /api/expenses/:id` - Deletar despesa

### Receitas
- `GET /api/incomes` - Listar receitas
- `GET /api/incomes/:id` - Buscar receita por ID
- `POST /api/incomes` - Criar nova receita
- `PUT /api/incomes/:id` - Atualizar receita
- `DELETE /api/incomes/:id` - Deletar receita

### Relatórios
- `GET /api/reports/balance` - Relatório de saldo
- `GET /api/reports/expenses` - Relatório de despesas
- `GET /api/reports/incomes` - Relatório de receitas
- `GET /api/reports/export` - Exportar relatório em Excel

## 🧪 Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Executar em modo desenvolvimento
npm run start:debug        # Executar com debug

# Produção
npm run build             # Compilar o projeto
npm run start:prod        # Executar em produção

```

## 🔧 Configurações

### CORS
O sistema está configurado para aceitar requisições de:
- `http://localhost:8081`
- `exp://localhost:8081`
- `http://10.0.0.6:8081`
- `exp://192.168.1.*:8081`
- `capacitor://*`
- `ionic://*`

### Validação Global
- **whitelist**: true - Remove propriedades não decoradas
- **transform**: true - Transforma payloads automaticamente

### Prefixo Global
Todas as rotas da API utilizam o prefixo `/api`

## 📈 Funcionalidades

### Controle Financeiro
- ✅ Gestão de receitas e despesas
- ✅ Categorização de transações
- ✅ Controle de saldo
- ✅ Histórico de transações

### Relatórios
- ✅ Relatório de saldo
- ✅ Relatório de despesas por categoria
- ✅ Relatório de receitas
- ✅ Exportação para Excel

### Autenticação e Segurança
- ✅ Autenticação JWT
- ✅ Criptografia de senhas
- ✅ Validação de dados
- ✅ Proteção de rotas

### Banco de Dados
- ✅ MongoDB com Mongoose
- ✅ Schemas tipados
- ✅ Relacionamentos entre entidades
- ✅ Scripts de população

## 🚀 Deploy

### Variáveis de Ambiente para Produção
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/cashtab
JWT_SECRET=chave-secreta-muito-segura
NODE_ENV=production
PORT=3001
```

### Comandos de Deploy
```bash
npm run build
npm run start:prod
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request


---

**CashTab Backend** - Controle financeiro simplificado e eficiente! 💰