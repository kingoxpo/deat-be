import { Controller, Get, Query } from '@nestjs/common';
import { StoreService } from '../../service/store.service';

@Controller('app/stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  getStores(@Query('category') category: number): string {
    return this.storeService.getStores(category);
  }
}
