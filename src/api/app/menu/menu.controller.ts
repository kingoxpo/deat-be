import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MenuService } from 'src/api/service/menu.service';
import { CreateMenuDto } from './menu.dto';

@Controller('app/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  async createMenu(@Body('params') params: CreateMenuDto) {
    console.log(params, '--Received params--');
    return this.menuService.createMenu(params);
  }

  @Get('store/:storeId')
  async getMenusByStore(@Param('storeId') storeId: string) {
    return this.menuService.getMenusByStore(storeId);
  }
}
