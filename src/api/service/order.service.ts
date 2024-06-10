import { Injectable } from '@nestjs/common';
import { OrderGateway } from '../app/gateway/order.gateway';

@Injectable()
export class OrdersService {
  constructor(private readonly orderGateway: OrderGateway) {}

  async updateOrderStatus(orderId: number, status: string) {
    // 주문 상태 업데이트 로직 (예: 데이터베이스 업데이트)
    // ...

    // WebSocket을 통해 클라이언트에게 상태 업데이트 알림
    this.orderGateway.server
      .to(`order_${orderId}`)
      .emit('orderStatusUpdate', { orderId, status });
  }
}
