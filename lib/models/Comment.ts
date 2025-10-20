import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId;
  parentType: 'question' | 'answer';
  parentId: Types.ObjectId;
  votes: number;
  upvotedBy: Types.ObjectId[];
  downvotedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    minlength: [5, 'Comment must be at least 5 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentType: {
    type: String,
    enum: ['question', 'answer'],
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'parentType'
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
CommentSchema.index({ parentType: 1, parentId: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });

// Update timestamp
CommentSchema.pre('save', function(this: IComment, next: () => void) {
  this.updatedAt = new Date();
  next();
});

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
