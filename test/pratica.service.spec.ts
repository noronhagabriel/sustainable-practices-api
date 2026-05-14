import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PraticaService } from '../src/pratica/pratica.service';
import { Pratica } from '../src/pratica/pratica.schema';
import { BadRequestException } from '@nestjs/common';

const mockPratica = {
  nomeUsuario: 'Ana Silva',
  tipo: 'Uso de copo reutilizável',
  data: '2026-05-14',
  descricao: 'Levei meu copo para o trabalho hoje.',
  save: jest.fn().mockResolvedValue({
    nomeUsuario: 'Ana Silva',
    tipo: 'Uso de copo reutilizável',
    data: '2026-05-14',
    descricao: 'Levei meu copo para o trabalho hoje.',
  }),
};

const mockPraticaModel = jest.fn().mockImplementation(() => mockPratica);

(mockPraticaModel as any).find = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockPratica]),
  }),
});

(mockPraticaModel as any).countDocuments = jest.fn().mockResolvedValue(5);

(mockPraticaModel as any).aggregate = jest.fn().mockResolvedValue([
  { _id: 'Uso de copo reutilizável', total: 3 },
]);

describe('PraticaService', () => {
  let service: PraticaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PraticaService,
        {
          provide: getModelToken(Pratica.name),
          useValue: mockPraticaModel,
        },
      ],
    }).compile();

    service = module.get<PraticaService>(PraticaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cadastrar', () => {
    it('deve cadastrar uma prática válida', async () => {
      const dto = {
        nomeUsuario: 'Ana Silva',
        tipo: 'Uso de copo reutilizável',
        data: '2026-05-14',
        descricao: 'Levei meu copo para o trabalho hoje.',
      };
      const result = await service.cadastrar(dto);
      expect(result).toBeDefined();
      expect(result.nomeUsuario).toBe('Ana Silva');
    });

    it('deve lançar BadRequestException para data inválida', async () => {
      const dto = {
        nomeUsuario: 'Ana Silva',
        tipo: 'Uso de copo reutilizável',
        data: '2026-99-99',
      };
      await expect(service.cadastrar(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('historico', () => {
    it('deve retornar lista de práticas sem filtros', async () => {
      const result = await service.historico({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('deve aplicar filtro por nomeUsuario', async () => {
      const result = await service.historico({ nomeUsuario: 'Ana' });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('estatisticas', () => {
    it('deve retornar objeto com todos os campos de estatísticas', async () => {
      (mockPraticaModel as any).aggregate = jest
        .fn()
        .mockResolvedValueOnce([{ _id: 'Uso de copo reutilizável', total: 3 }])
        .mockResolvedValueOnce([{ _id: 'Ana Silva', total: 3 }]);

      const result = await service.estatisticas();
      expect(result).toHaveProperty('totalGeralDePraticas');
      expect(result).toHaveProperty('tipoDePraticaMaisRegistrada');
      expect(result).toHaveProperty('usuarioComMaisRegistros');
      expect(result).toHaveProperty('totalDePraticasPorTipo');
      expect(result).toHaveProperty('mediaDiariaDeRegistrosUltimos30Dias');
    });
  });
});
