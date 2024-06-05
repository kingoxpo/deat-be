import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from './store.schema';
import { CreateStoreDto } from '../app/store/store.dto';

@Injectable()
export class StoreService {
  constructor(@InjectModel(Store.name) private storeModel: Model<Store>) {}

  async getStores(category: number): Promise<Store[]> {
    console.log('Querying category:', +category);
    const stores = await this.storeModel.find({ cate: +category }).exec();
    console.log('Fetched stores:', stores); // 콘솔에 출력
    return stores;
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
