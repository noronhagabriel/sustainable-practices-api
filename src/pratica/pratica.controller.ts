import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PraticaService } from './pratica.service';
import { CreatePraticaDto } from './dto/create-pratica.dto';
import { QueryHistoricoDto } from './dto/query-historico.dto';

@Controller()
export class PraticaController {
  constructor(private readonly praticaService: PraticaService) {}

  /**
   * POST /pratica
   * Cadastra uma nova prática sustentável.
   */
  @Post('pratica')
  @HttpCode(HttpStatus.CREATED)
  async cadastrar(@Body() dto: CreatePraticaDto) {
    const pratica = await this.praticaService.cadastrar(dto);
    return {
      message: 'Prática sustentável registrada com sucesso!',
      data: pratica,
    };
  }

  /**
   * GET /historico
   * Retorna a lista de práticas com filtros opcionais.
   */
  @Get('historico')
  async historico(@Query() query: QueryHistoricoDto) {
    const praticas = await this.praticaService.historico(query);
    return {
      total: praticas.length,
      filtrosAplicados: query,
      data: praticas,
    };
  }

  /**
   * GET /estatisticas
   * Retorna o resumo consolidado das práticas sustentáveis.
   */
  @Get('estatisticas')
  async estatisticas() {
    return this.praticaService.estatisticas();
  }
}
