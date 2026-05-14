import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🌱 API de Práticas Sustentáveis rodando na porta ${port}`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   POST   http://localhost:${port}/pratica`);
  console.log(`   GET    http://localhost:${port}/historico`);
  console.log(`   GET    http://localhost:${port}/estatisticas`);
}
bootstrap();
