import { Test, TestingModule } from '@nestjs/testing';
import { DepartamentosService } from './departamentos.service';
import { Departamento } from './entities/departamento.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

const mockDepartamento = { id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', nombre: 'Marketing' };

const mockDepartamentoRepository = {
  create: jest.fn().mockReturnValue(mockDepartamento),
  save: jest.fn().mockResolvedValue(mockDepartamento),
  find: jest.fn().mockResolvedValue([mockDepartamento]),
  findOneBy: jest.fn().mockResolvedValue(mockDepartamento),
  update: jest.fn().mockResolvedValue({mockDepartamento}),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('DepartamentosService', () => {
  let service: DepartamentosService;
  let repository: Repository<Departamento>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartamentosService,
        {
          provide: getRepositoryToken(Departamento),
          useValue: mockDepartamentoRepository,
        },
      ],
    }).compile();

    service = module.get<DepartamentosService>(DepartamentosService);
    repository = module.get<Repository<Departamento>>(getRepositoryToken(Departamento));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a departamento', async () => {
      const createDto: CreateDepartamentoDto = { nombre: 'Finanzas' };
      const result = await service.create(createDto);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockDepartamento);
      expect(result).toEqual(mockDepartamento);
    });
  });


  describe('findAll', () => {
    it('should return an array of departamentos', async () => {
      const result = await service.findAll(1);
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockDepartamento]);
    });
  });

  describe('findOne', () => {
    it('should return a departamento', async () => {
      const result = await service.findOne('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377' });
      expect(result).toEqual(mockDepartamento);
    });

    it('should throw a BadRequestException if departamento is not found', async () => {
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.findOne('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update and return a departamento', async () => {
      const updateDto: UpdateDepartamentoDto = { nombre: 'RRHH' };
      const result = await service.findOne('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(service.findOne).toHaveBeenCalledWith({ id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377' });
      expect(repository.update).toHaveBeenCalledWith('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', updateDto);
      expect(service.findOne).toHaveBeenCalledWith({ id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377' });
      expect(result).toEqual(mockDepartamento);
    });

    it('should throw a BadRequestException if departamento to update is not found', async () => {
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.update('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377', {})).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a departamento', async () => {
      const result = await service.remove('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377');
      expect(service.findOne).toHaveBeenCalledWith({ id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377' })
      expect(repository.delete).toHaveBeenCalledWith({ id: 'b27b9f8e-bcbb-4a34-bf2d-839c2fd73377' });
      expect(result).toEqual({ deleted: true, message: 'departamento eliminado' });
    });

    it('should throw a BadRequestException if departamento to remove is not found', async () => {
      repository.findOneBy = jest.fn().mockResolvedValue(null);
      await expect(service.remove('b27b9f8e-bcbb-4a34-bf2d-839c2fd73377')).rejects.toThrow(BadRequestException);
    });
  });
});
