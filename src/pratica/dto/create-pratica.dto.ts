import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreatePraticaDto {
  @IsString()
  @IsNotEmpty({ message: 'O campo nomeUsuario é obrigatório.' })
  nomeUsuario: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo tipo é obrigatório.' })
  tipo: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo data é obrigatório.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'O campo data deve estar no formato ISO: YYYY-MM-DD.',
  })
  data: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
