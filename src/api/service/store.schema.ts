import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const StoreSchema = SchemaFactory.createForClass(Store);
