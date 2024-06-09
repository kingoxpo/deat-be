import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from '../schema/store.schema';
import { CreateStoreDto } from '../app/store/store.dto';
import { Menu } from '../schema/menu.schema';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<Store>,
    @InjectModel(Menu.name) private readonly menuModel: Model<Menu>,
  ) {}

  async getStores(category?: number): Promise<any[]> {
    const query = category !== undefined ? { cate: +category } : {};

    const re = this.storeModel
      .find(query)
      .populate({
        path: 'menus',
        model: 'Menu',
        match: { storeId: { $exists: true } },
      })
      .exec();

    return re;
  }

  async createStore(createStoreDto: CreateStoreDto): Promise<Store> {
    const newStore = new this.storeModel(createStoreDto);
    return newStore.save();
  }

  async updateStore(id: string, updateData: Partial<Store>): Promise<Store> {
    return this.storeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }
}
