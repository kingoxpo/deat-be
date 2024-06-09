import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'mem' })
export class Store extends Document {
  @Prop()
  name: string;

  @Prop({ required: true })
  cate: number;

  @Prop()
  add1: string;

  @Prop()
  add2: string;

  @Prop()
  email: string;

  @Prop()
  htel: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Menu' }] })
  menus: Types.ObjectId[];
}

export const StoreSchema = SchemaFactory.createForClass(Store);
