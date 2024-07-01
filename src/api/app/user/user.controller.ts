import { Controller, Post, Body } from '@nestjs/common';
import { StoreService } from '../../service/store.service';
import { UserService } from 'src/api/service/user.service';

@Controller('app/auth')
export class UserController {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
  ) {}
  @Post('signup')
  async signUp(
    @Body() body: { email: string; password: string },
  ): Promise<{ success: boolean; message?: string }> {
    return await this.userService.signUp(body);
  }

  @Post('login')
  async login(
    @Body() params: { email: string; password: string },
  ): Promise<{ success: boolean; token?: string }> {
    return await this.userService.login(params);
  }

  
  /**
   * 인증토큰 발행 (REST API 방식)
   */
  // @Post('auth')
  // async auth(
  //   @Req() req: Request,
  //   @ClientInfo() cInfo: IClientInfo,
  //   @Body() params: AuthInput,
  // ): Promise<{ token: string }> {
  //   return await this.userService.auth(params, cInfo, req);
  // }

  // @Post('login')
  // async login(
  //   @Body() body: { email: string; password: string },
  // ): Promise<{ success: boolean }> {
  //   return await this.userService.login(body);
  // }
}
