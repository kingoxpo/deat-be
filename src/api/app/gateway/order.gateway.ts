import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class OrderGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('orderStatus')
  handleOrderStatus(
    @MessageBody() data: { orderId: number; status: string },
  ): void {
    // 특정 클라이언트에게 메시지 전송
    this.server.to(`order_${data.orderId}`).emit('orderStatusUpdate', data);
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
