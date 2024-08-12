import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../service/auth/auth.service';

@Controller('app/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('cafe24-token')
  async getToken(@Body('code') code: string) {
    return await this.authService.getCafe24Token(code);
  }
}
