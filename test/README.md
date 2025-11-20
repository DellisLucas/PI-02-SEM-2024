# 📋 Documentação de Testes - Sistema de Controle Financeiro MEI

Este diretório contém os testes do sistema, organizados em três categorias principais:

## 📁 Estrutura de Diretórios

```
test/
├── unit/                    # Testes unitários
│   └── unit-tests.spec.ts   # Testes unitários completos
├── integration/             # Testes de integração
│   └── integration-tests.spec.ts  # Testes de integração completos
├── e2e/                    # Testes end-to-end (já existente)
│   └── app.e2e-spec.ts
├── jest-unit.json          # Configuração Jest para testes unitários
├── jest-integration.json   # Configuração Jest para testes de integração
├── jest-e2e.json           # Configuração Jest para testes E2E
├── setup.ts                # Configuração global para testes
└── README.md               # Este arquivo
```

## 🧪 Tipos de Testes

### 1. Testes Unitários (`test/unit/`)

Testam componentes isolados (services, controllers, guards) sem dependências externas.

**Cobertura:**
- ✅ AuthService e AuthController
- ✅ UserService
- ✅ ExpenseService e ExpenseController
- ✅ IncomeService e IncomeController
- ✅ ReportsService e ReportsController

**Executar:**
```bash
# Todos os testes unitários
npm run test:unit

# Modo watch (re-executa ao salvar arquivos)
npm run test:unit:watch

# Com cobertura de código
npm run test:unit:cov
```

### 2. Testes de Integração (`test/integration/`)

Testam a interação entre módulos e o banco de dados MongoDB.

**Cobertura:**
- ✅ Integração Auth + User (fluxo completo de registro/login)
- ✅ Integração Expense + User (criação e associação)
- ✅ Integração Income + User (criação e associação)
- ✅ Integração Report + Expense + Income (relatórios com dados reais)
- ✅ Fluxos completos de integração
- ✅ Isolamento de dados entre usuários

**Executar:**
```bash
# Todos os testes de integração
npm run test:integration

# Modo watch
npm run test:integration:watch

# Com cobertura de código
npm run test:integration:cov
```

**⚠️ Importante:** Os testes de integração requerem uma instância do MongoDB rodando. Configure a variável de ambiente `MONGODB_URI` ou use o padrão `mongodb://localhost:27017/cashtab-test`.

### 3. Testes E2E (`test/e2e/`)

Testam fluxos completos do sistema através de requisições HTTP.

**Executar:**
```bash
npm run test:e2e
```

## 🚀 Executando Todos os Testes

```bash
# Executar todos os tipos de testes em sequência
npm run test:all

# Ou executar individualmente
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📊 Cobertura de Testes

### Metas de Cobertura

- **Mínima**: 80%
- **Ideal**: 90%+
- **Crítica**: 100% (auth, validações, segurança)

### Cobertura por Módulo

| Módulo | Cobertura Mínima | Cobertura Ideal |
|--------|------------------|-----------------|
| Auth | 95% | 100% |
| User | 85% | 95% |
| Expense | 85% | 95% |
| Income | 85% | 95% |
| Report | 80% | 90% |

## 🔧 Configuração

### Variáveis de Ambiente

Os testes usam as seguintes variáveis de ambiente (com valores padrão):

```bash
MONGODB_URI=mongodb://localhost:27017/cashtab-test
JWT_SECRET=test-secret-key
```

### Arquivo de Setup

O arquivo `test/setup.ts` é executado antes de cada teste e configura:
- Timeout padrão (30 segundos)
- Variáveis de ambiente padrão
- Configurações globais do Jest

## 📝 Exemplos de Testes

### Exemplo: Teste Unitário

```typescript
describe('AuthService', () => {
  it('deve criar usuário com dados válidos', async () => {
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const result = await authService.register(createUserDto);
    
    expect(result).toHaveProperty('access_token');
    expect(result.user.email).toBe(createUserDto.email);
  });
});
```

### Exemplo: Teste de Integração

```typescript
describe('Integração Expense + User', () => {
  it('deve criar despesa e associar ao usuário', async () => {
    const expense = await expenseService.create({
      description: 'Test Expense',
      amount: 100,
      date: new Date(),
      userId: userId,
    });

    const expenses = await expenseService.findAll(userId);
    expect(expenses).toContainEqual(
      expect.objectContaining({ description: 'Test Expense' })
    );
  });
});
```

## 🐛 Troubleshooting

### Erro: "Cannot find module"

Certifique-se de que todas as dependências estão instaladas:
```bash
npm install
```

### Erro: "MongoDB connection failed"

Verifique se o MongoDB está rodando:
```bash
# Verificar status
mongosh --eval "db.version()"

# Ou iniciar MongoDB
sudo systemctl start mongod
```

### Erro: "Timeout"

Aumente o timeout no arquivo `test/setup.ts`:
```typescript
jest.setTimeout(60000); // 60 segundos
```

## 📈 Próximos Passos

- [ ] Adicionar testes para módulos futuros (Client, Installment, AI)
- [ ] Implementar testes de performance
- [ ] Adicionar testes de segurança mais específicos
- [ ] Configurar CI/CD para execução automática de testes

## 📚 Referências

- [Documentação Jest](https://jestjs.io/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest](https://github.com/visionmedia/supertest)
- [Plano de Testes](../PLANO_DE_TESTES.md)

---

**Versão**: 1.0.0 | **Última atualização**: 2024

