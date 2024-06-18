import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';
import { JwtService } from '../../common/jwt/jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

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

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newMember = new this.userModel({
        email: data.email,
        password: hashedPassword,
      });

      await newMember.save();

      return { success: true };
    } catch (error) {
      console.error(error); // 에러 로깅
      return { success: false, message: 'An error occurred during sign up' };
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; m_no?: number; token?: string }> {
    const user = await this.userModel.findOne({ email: data.email }).exec();

    if (!user) {
      return { success: false };
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      return { success: false };
    }

    const token = await this.jwtService.sign({
      email: user.email,
    });

    return {
      success: true,
      token: token,
    };
  }
}
