import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentosController } from './departamentos.controller';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

describe('DepartamentosController', () => {
  let controller: DepartamentosController;
  let service: DepartamentosService;

  const mockDepartamento = {
    id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377',
    nombre: 'Finanzas',
  };

  const mockDepartamentosService = {
    create: jest.fn().mockResolvedValue(mockDepartamento),
    findAll: jest.fn().mockResolvedValue([mockDepartamento]),
    findOne: jest.fn().mockResolvedValue(mockDepartamento),
    update: jest.fn().mockResolvedValue(mockDepartamento),
    remove: jest.fn().mockResolvedValue({ deleted: true, message: 'departamento eliminado' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartamentosController],
      providers: [
        {
          provide: DepartamentosService,
          useValue: mockDepartamentosService,
        },
      ],
    }).compile();

    controller = module.get<DepartamentosController>(DepartamentosController);
    service = module.get<DepartamentosService>(DepartamentosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a departamento', async () => {
      const createDto: CreateDepartamentoDto = { nombre: 'RRHH' };
      const result = await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockDepartamento);
    });
  });

  describe('findAll', () => {
    it('should return an array of departamentos', async () => {
      const result = await controller.findAll('1');
      expect(service.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockDepartamento]);
    });
  });

  describe('findOne', () => {
    it('should return a single departamento', async () => {
      const result = await controller.findOne('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(service.findOne).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(result).toEqual(mockDepartamento);
    });
  });

  describe('update', () => {
    it('should update and return a departamento', async () => {
      const updateDto: UpdateDepartamentoDto = { nombre: 'RRHH' };
      const result = await controller.update('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', updateDto);
      expect(service.update).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', updateDto);
      expect(result).toEqual(mockDepartamento);
    });
  });

  describe('remove', () => {
    it('should delete a departamento', async () => {
      const result = await controller.remove('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(service.remove).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(result).toEqual({ deleted: true, message: 'departamento eliminado' });
    });
  });
});
