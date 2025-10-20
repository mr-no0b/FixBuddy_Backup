import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  tags: Types.ObjectId[];
  views: number;
  votes: number;
  upvotedBy: Types.ObjectId[];
  downvotedBy: Types.ObjectId[];
  answers: Types.ObjectId[];
  acceptedAnswer?: Types.ObjectId;
  status: 'open' | 'closed' | 'solved';
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema<IQuestion> = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [30, 'Content must be at least 30 characters'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
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
  answers: [{
    type: Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Answer',
    default: null
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'solved'],
    default: 'open'
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

// Indexes for faster queries
QuestionSchema.index({ author: 1, createdAt: -1 });
QuestionSchema.index({ tags: 1 });
QuestionSchema.index({ status: 1, createdAt: -1 });
QuestionSchema.index({ votes: -1 });
QuestionSchema.index({ createdAt: -1 });

// Update the updatedAt timestamp before saving
QuestionSchema.pre('save', function(this: IQuestion, next: () => void) {
  this.updatedAt = new Date();
  next();
});

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);

export default Question;
