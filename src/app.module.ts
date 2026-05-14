import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PraticaModule } from './pratica/pratica.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/praticas-sustentaveis',
    ),
    PraticaModule,
  ],
})
export class AppModule {}
