export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ExtractedOrder {
  customerName?: string;
  pickupAddress?: string;
  dropAddress?: string;
  materialType?: string;
  quantityValue?: number;
  quantityUnit?: string;
  scheduledDate?: string;
  confidence: number;
}
