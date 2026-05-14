import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pratica, PraticaDocument } from './pratica.schema';
import { CreatePraticaDto } from './dto/create-pratica.dto';
import { QueryHistoricoDto } from './dto/query-historico.dto';

@Injectable()
export class PraticaService {
  constructor(
    @InjectModel(Pratica.name) private praticaModel: Model<PraticaDocument>,
  ) {}

  async cadastrar(dto: CreatePraticaDto): Promise<PraticaDocument> {
    // Valida se a data é uma data real
    const dataObj = new Date(dto.data + 'T00:00:00');
    if (isNaN(dataObj.getTime())) {
      throw new BadRequestException('Data inválida.');
    }

    const novaPratica = new this.praticaModel(dto);
    return novaPratica.save();
  }

  async historico(query: QueryHistoricoDto): Promise<PraticaDocument[]> {
    const filtro: any = {};

    if (query.nomeUsuario) {
      filtro.nomeUsuario = { $regex: query.nomeUsuario, $options: 'i' };
    }

    if (query.tipo) {
      filtro.tipo = { $regex: query.tipo, $options: 'i' };
    }

    if (query.dataInicial || query.dataFinal) {
      filtro.data = {};
      if (query.dataInicial) filtro.data.$gte = query.dataInicial;
      if (query.dataFinal) filtro.data.$lte = query.dataFinal;
    }

    return this.praticaModel.find(filtro).sort({ data: -1, createdAt: -1 }).exec();
  }

  async estatisticas() {
    const total = await this.praticaModel.countDocuments();

    // Tipo mais registrado e total por tipo
    const porTipo = await this.praticaModel.aggregate([
      { $group: { _id: '$tipo', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Usuário com mais registros
    const porUsuario = await this.praticaModel.aggregate([
      { $group: { _id: '$nomeUsuario', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);

    // Média diária dos últimos 30 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];

    const totalUltimos30 = await this.praticaModel.countDocuments({
      data: { $gte: dataLimiteStr },
    });

    const mediaDiaria = parseFloat((totalUltimos30 / 30).toFixed(2));

    return {
      totalGeralDePraticas: total,
      tipoDePraticaMaisRegistrada: porTipo.length > 0 ? porTipo[0]._id : null,
      usuarioComMaisRegistros: porUsuario.length > 0 ? porUsuario[0]._id : null,
      totalDePraticasPorTipo: porTipo.map((item) => ({
        tipo: item._id,
        total: item.total,
      })),
      mediaDiariaDeRegistrosUltimos30Dias: mediaDiaria,
    };
  }
}
