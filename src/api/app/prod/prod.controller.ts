import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductService } from '../../service/prod/prod.service' // Add this line

@Controller('app/prod')
export class ProductController {
  constructor(
    private readonly productService: ProductService
) {}

  @Get('cafe24-prod')
  async getCafe24Prod(@Body() params: any) {
    return await this.productService.getCafe24Prod(params);
  }
}