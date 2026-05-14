import { IsOptional, IsString, Matches } from 'class-validator';

export class QueryHistoricoDto {
  @IsOptional()
  @IsString()
  nomeUsuario?: string;

  @IsOptional()
  @IsString()
  tipo?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dataInicial deve estar no formato YYYY-MM-DD.',
  })
  dataInicial?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dataFinal deve estar no formato YYYY-MM-DD.',
  })
  dataFinal?: string;
}
