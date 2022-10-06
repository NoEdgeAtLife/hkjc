import { Test, TestingModule } from '@nestjs/testing';
import { OddController } from './odd.controller';

describe('OddController', () => {
  let controller: OddController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OddController],
    }).compile();

    controller = module.get<OddController>(OddController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
