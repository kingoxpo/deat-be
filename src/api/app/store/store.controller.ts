import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { StoreService } from '../../service/store.service';
import { Store } from 'src/api/service/store.schema';
import { CreateStoreDto } from './store.dto';
import { UserService } from 'src/api/service/user.service';

@Controller('app/stores')
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getStores(@Query('category') category: number): Promise<Store[]> {
    console.log('안들어오나?');

    return this.storeService.getStores(category);
  }

  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return this.storeService.createStore(createStoreDto);
  }

  @Put(':id')
  async updateStore(
    @Param('id') id: string,
    @Body() updateStoreDto: Partial<Store>,
  ): Promise<Store> {
    return this.storeService.updateStore(id, updateStoreDto);
  }

  /**
   * 인증토큰 발행
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

  @Post('signup')
  async signUp(
    @Body() body: { email: string; password: string },
  ): Promise<{ success: boolean; message?: string }> {
    return await this.userService.signUp(body);
  }
}
