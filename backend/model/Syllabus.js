import mongoose from 'mongoose';

const syllabusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  teacher: { type: String },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Syllabus', syllabusSchema);
