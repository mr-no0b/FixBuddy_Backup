import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IAnswer extends Document {
  content: string;
  author: Types.ObjectId;
  question: Types.ObjectId;
  votes: number;
  upvotedBy: Types.ObjectId[];
  downvotedBy: Types.ObjectId[];
  isAccepted: boolean;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema<IAnswer> = new Schema({
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    minlength: [20, 'Answer must be at least 20 characters'],
    maxlength: [10000, 'Answer cannot exceed 10000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
AnswerSchema.index({ question: 1, createdAt: -1 });
AnswerSchema.index({ author: 1 });
AnswerSchema.index({ votes: -1 });

// Update the updatedAt timestamp before saving
AnswerSchema.pre('save', function(this: IAnswer, next: () => void) {
  this.updatedAt = new Date();
  next();
});

const Answer: Model<IAnswer> = mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);

export default Answer;
