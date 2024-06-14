import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user' })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  combine_yn: boolean;

  @Prop()
  m_no: number;

  @Prop()
  sol_no: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
