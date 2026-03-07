export interface InvoiceData {
  id: string;
  ownerId: string;
  orderId: string;
  jobId: string;
  invoiceNumber: string;
  customerName: string;
  fromAddress: string;
  toAddress: string;
  materialType: string;
  quantityValue?: number;
  quantityUnit?: string;
  freightCharge: number;
  loadingCharge?: number;
  unloadingCharge?: number;
  otherCharges?: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  paymentDueDate?: number;
  vehicleNumber?: string;
  pdfPath?: string;
  createdAt: number;
}
