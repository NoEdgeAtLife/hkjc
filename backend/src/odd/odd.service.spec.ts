import { Test, TestingModule } from '@nestjs/testing';
import { OddService } from './odd.service';

describe('OddService', () => {
  let service: OddService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OddService],
    }).compile();

    service = module.get<OddService>(OddService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
