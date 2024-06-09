import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { StoreService } from '../../service/store.service';
import { CreateStoreDto } from './store.dto';
import { Store } from 'src/api/schema/store.schema';

@Controller('app/stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  async getStores(@Query('category') category?: number): Promise<Store[]> {
    return this.storeService.getStores(category);
  }

  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeService.createStore(createStoreDto);
  }

  @Put(':id')
  async updateStore(
    @Param('id') id: string,
    @Body() updateStoreDto: Partial<Store>,
  ): Promise<Store> {
    return this.storeService.updateStore(id, updateStoreDto);
  }
}
