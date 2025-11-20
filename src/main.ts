import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração global de validação
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Configuração do CORS
  app.enableCors({
    origin: [
      'http://localhost:8081',
      'exp://localhost:8081',
      'http://10.0.0.6:8081',
      'exp://192.168.1.*:8081',
      'exp://*',
      'capacitor://*',
      'ionic://*',
      'http://*',
      'https://*',
      '*'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Configuração global de prefixo
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  await app.listen(3001);
}
bootstrap();
