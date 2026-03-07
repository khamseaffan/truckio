import { Model } from '@nozbe/watermelondb';
import { field, date, text, readonly } from '@nozbe/watermelondb/decorators';

export default class Invoice extends Model {
  static table = 'invoices';

  @text('owner_id') ownerId!: string;
  @text('order_id') orderId!: string;
  @text('job_id') jobId!: string;
  @text('invoice_number') invoiceNumber!: string;
  @text('customer_name') customerName!: string;
  @text('from_address') fromAddress!: string;
  @text('to_address') toAddress!: string;
  @text('material_type') materialType!: string;
  @field('quantity_value') quantityValue!: number;
  @text('quantity_unit') quantityUnit!: string;
  @field('freight_charge') freightCharge!: number;
  @field('loading_charge') loadingCharge!: number;
  @field('unloading_charge') unloadingCharge!: number;
  @field('other_charges') otherCharges!: number;
  @field('total_amount') totalAmount!: number;
  @text('payment_status') paymentStatus!: string;
  @field('payment_due_date') paymentDueDate!: number;
  @text('vehicle_number') vehicleNumber!: string;
  @text('pdf_path') pdfPath!: string;
  @text('template_id') templateId!: string;
  @readonly @date('created_at') createdAt!: Date;
}
