import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
   origin: ['http://localhost:3000', 'https://pi-front-lac.vercel.app', 'https://cashtab.com.br'], //urls permitidas
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization',  // Cabeçalhos permitidos
  });

  await app.listen(3001);
}
bootstrap();
