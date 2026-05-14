import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PraticaDocument = HydratedDocument<Pratica>;

@Schema({ timestamps: true })
export class Pratica {
  @Prop({ required: true, trim: true })
  nomeUsuario: string;

  @Prop({ required: true, trim: true })
  tipo: string;

  @Prop({ required: true })
  data: string;

  @Prop({ trim: true, default: '' })
  descricao: string;
}

export const PraticaSchema = SchemaFactory.createForClass(Pratica);

// Índices para otimizar as consultas de filtro e estatísticas
PraticaSchema.index({ nomeUsuario: 1 });
PraticaSchema.index({ tipo: 1 });
PraticaSchema.index({ data: 1 });
