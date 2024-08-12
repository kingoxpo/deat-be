import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from 'src/api/service/excel/excel.service';
import * as Multer from 'multer';


@Controller('/app/excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  // @Post()
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return this.excelService.processFile(file);
  // }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: Multer.memoryStorage(), // 메모리 저장소 사용
      fileFilter: (req, file, cb) => {
        // 엑셀 파일과 CSV 파일 모두 허용하도록 수정
        if (!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
          return cb(new BadRequestException('Only Excel or CSV files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.excelService.processFile(file);
  }
}
