// Arquivo de configuração global para testes
// Este arquivo é executado antes de cada teste

// Configurar timeout padrão para testes
jest.setTimeout(30000);

// Mock de variáveis de ambiente se necessário
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashtab-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Suprimir logs durante testes (opcional)
// console.log = jest.fn();
// console.error = jest.fn();
// console.warn = jest.fn();

