export interface MarketData {
  type: 'market_stream_open' | 'market_stream_message';
  symbol: string;
  data: any;
}

export interface UserData {
  type: 'user_data';
  userId: string;
  data: any;
}

export type WSData = MarketData | UserData;
export type MessageHandler = (data: WSData) => void;

interface SubscribeMessage {
  type: string;
  payload: {
    symbol?: string;
    streams?: string[];
    userId?: string;
  };
}

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;
  private readonly url: string = 'ws://52.194.218.184:3001';
  private messageHandlers = new Map<string, MessageHandler>();  // 消息处理函数
  private reconnectAttempts = 0;  // 重连次数
  private readonly maxReconnectAttempts = 5;  // 最大重连次数
  private readonly reconnectInterval = 3000;  // 重连间隔
  private pingInterval: number | null = null;  // 心跳间隔
  private isConnecting = false;  // 是否连接中
  private isManualClosed = false; // 新增：标记是否为主动关闭

  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }

    WebSocketService.instance = this;
    this.connect();
  }

  private connect(): void {
    if (this.isConnecting || (this.ws?.readyState === WebSocket.OPEN) || this.isManualClosed) {
      return;
    }

    this.isConnecting = true;
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
      // 重新订阅所有数据
      this.messageHandlers.forEach((handler, key) => {
        const [type, ...params] = key.split('-');
        if (type === 'market') {
          const [symbol, streams] = params;
          this.subscribeMarket(symbol, streams.split('&'), handler);
        } else if (type === 'user') {
          const [userId] = params;
          this.subscribeUserData(userId, handler);
        }
      });
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as WSData;
        this.messageHandlers.forEach(handler => {
          handler(data);
        });
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected', event);
      this.isConnecting = false;
      this.cleanup();
      
      // 只有在非主动关闭的情况下才尝试重连
      if (!this.isManualClosed) {
        console.log('Connection lost unexpectedly, attempting to reconnect...');
        this.tryReconnect();
      } else {
        console.log('Connection closed manually, no reconnection needed');
        this.messageHandlers.clear();
      }
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
    };
  }

  // 订阅
  private subscribe(key: string, messageHandler: MessageHandler, subscribeMessage?: SubscribeMessage): () => void {
    if (this.messageHandlers.has(key)) {
      this.unsubscribe(key);
    }

    this.messageHandlers.set(key, messageHandler);

    if (subscribeMessage && this.ws?.readyState === WebSocket.OPEN) {
      this.send(subscribeMessage);
    }
    return () => this.unsubscribe(key, subscribeMessage);
  }

  // 取消订阅
  private unsubscribe(key: string, subscribeMessage?: SubscribeMessage): void {
    this.messageHandlers.delete(key);

    const { type='', payload={ symbol: '', streams: [] } } = subscribeMessage || {};
    if (type === 'subscribe_market') {
      this.ws?.send(JSON.stringify({
        type: 'unsubscribe_market',
        payload: {
          symbol: payload.symbol,
          streams: payload.streams
        }
      }));
    }
  }

  // 发送消息
  private send(message: SubscribeMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // 开始心跳
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', payload: {} });
      }
    }, 30000);
  }

  // 停止心跳
  private stopHeartbeat(): void {
    if (this.pingInterval) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // 清理连接
  private cleanup(): void {
    this.stopHeartbeat();
  }

  // 尝试重新连接
  private tryReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    window.setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  // 订阅市场数据
  public subscribeMarket(symbol: string, streams: string[], callback: MessageHandler): () => void {
    const key = `market-${symbol}-${streams.join('&')}`;
    const subscribeMessage: SubscribeMessage = {
      type: 'subscribe_market',
      payload: { symbol, streams }
    };

    return this.subscribe(key, callback, subscribeMessage);
  }

  // 订阅用户数据
  public subscribeUserData(userId: string, callback: MessageHandler): () => void {
    const key = `user-${userId}`;
    const subscribeMessage: SubscribeMessage = {
      type: 'subscribe_user_data',
      payload: { userId }
    };

    return this.subscribe(key, callback, subscribeMessage);
  }

  // 关闭连接
  public close(): void {
    this.isManualClosed = true; // 设置主动关闭标记
    this.ws?.close();
  }

  // 开始连接
  public start(): void {
    this.isManualClosed = false; // 重置主动关闭标记
    this.connect();
  }
}

// 创建并导出单例
export default WebSocketService;
