import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Income extends Document {
  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop()
  category?: string;

  @Prop()
  image?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const IncomeSchema = SchemaFactory.createForClass(Income); 