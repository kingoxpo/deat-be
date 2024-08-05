import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store } from './store.schema';
import { CreateStoreDto } from '../app/store/store.dto';
import { MysqlService } from '../../libs/mysql/mysql.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<Store>,
    private db: MysqlService,
  ) {}

  async getStores(category: number): Promise<Store[]> {
    // Example of using MysqlService
    // const prod = await this.db.query('SELECT * FROM prod WHERE prod_no = ?', [
    //   category,
    // ]);
    //
    // console.log('Prod from MySQL:', prod);

    return await this.storeModel.find({ cate: +category }).exec();
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
