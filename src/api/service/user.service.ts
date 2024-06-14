import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async signUp(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const existingMember = await this.userModel.findOne({
        email: data.email,
      });
      if (existingMember) {
        return { success: false, message: 'Email already exists' };
      }

      const hashedPassword = crypto
        .createHash('sha256')
        .update(crypto.createHash('md5').update(data.password).digest('hex'))
        .digest('hex');
      const newMember = new this.userModel({
        email: data.email,
        password: hashedPassword,
        combine_yn: true,
      });

      await newMember.save();

      return { success: true };
    } catch (error) {
      return { success: false, message: 'An error occurred during sign up' };
    }
  }
}
