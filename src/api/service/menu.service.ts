import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Menu } from '../schema/menu.schema';
import { CreateMenuDto } from '../app/menu/menu.dto';

@Injectable()
export class MenuService {
  constructor(@InjectModel(Menu.name) private menuModel: Model<Menu>) {}
  async createMenu(createMenuDto: CreateMenuDto): Promise<Menu> {
    const newMenu = new this.menuModel(createMenuDto);
    return newMenu.save();
  }

  async getMenusByStore(storeId: string): Promise<Menu[]> {
    return this.menuModel.find({ storeId }).exec();
  }
}
