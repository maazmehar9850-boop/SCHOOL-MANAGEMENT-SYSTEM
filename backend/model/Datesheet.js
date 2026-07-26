import mongoose from 'mongoose';

const datesheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  teacher: { type: String },
  entries: [
    {
      subject: String,
      date: String,
      time: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Datesheet', datesheetSchema);
