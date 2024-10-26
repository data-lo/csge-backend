import { Test, TestingModule } from '@nestjs/testing';
import { PuestosController } from './puestos.controller';
import { PuestosService } from './puestos.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

describe('PuestosController', () => {
  let controller: PuestosController;
  let service: PuestosService;

  const mockPuesto = {
    id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377',
    nombre: 'Gerente',
  };

  const mockPuestosService = {
    create: jest.fn().mockResolvedValue(mockPuesto),
    findAll: jest.fn().mockResolvedValue([mockPuesto]),
    findOne: jest.fn().mockResolvedValue(mockPuesto),
    update: jest.fn().mockResolvedValue(mockPuesto),
    remove: jest.fn().mockResolvedValue({ deleted: true, message: 'Puesto eliminado' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuestosController],
      providers: [
        {
          provide: PuestosService,
          useValue: mockPuestosService,
        },
      ],
    }).compile();

    controller = module.get<PuestosController>(PuestosController);
    service = module.get<PuestosService>(PuestosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a puesto', async () => {
      const createDto: CreatePuestoDto = { nombre: 'Gerente' };
      const result = await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPuesto);
    });
  });

  describe('findAll', () => {
    it('should return an array of puestos', async () => {
      const result = await controller.findAll('1');
      expect(service.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockPuesto]);
    });
  });

  describe('findOne', () => {
    it('should return a single puesto', async () => {
      const result = await controller.findOne('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(service.findOne).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(result).toEqual(mockPuesto);
    });
  });

  describe('update', () => {
    it('should update and return a puesto', async () => {
      const updateDto: UpdatePuestoDto = { nombre: 'Director' };
      const result = await controller.update('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', updateDto);
      expect(service.update).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', updateDto);
      expect(result).toEqual(mockPuesto);
    });
  });

  describe('remove', () => {
    it('should delete a puesto', async () => {
      const result = await controller.remove('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(service.remove).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(result).toEqual({ deleted: true, message: 'Puesto eliminado' });
    });
  });
});
