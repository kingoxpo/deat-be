import { Injectable } from '@nestjs/common';

@Injectable()
export class StoreService {
  getStores(category: number): string {
    // 실제 서비스 로직을 추가할 수 있습니다.
    // 예를 들어, 데이터베이스에서 카테고리별로 스토어 정보를 가져오는 로직 등
    return `Category: ${category}`;
  }
}
