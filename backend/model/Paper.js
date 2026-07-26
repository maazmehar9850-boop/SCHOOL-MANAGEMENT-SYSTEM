import mongoose from 'mongoose';

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  teacher: { type: String },
  questions: [
    {
      q: String,
      marks: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Paper', paperSchema);
