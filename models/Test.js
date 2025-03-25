import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the test
  description: { type: String, required: true }, // Description of the test
  batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true }, // Reference to the Batch model
  questions: [
    {
      question: { type: String, required: true }, // Question text
      options: [{ type: String, required: true }], // Array of options
      correctAnswer: { type: String, required: true }, // Correct answer
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for updates
});

// Create the Test model
const Test = mongoose.model("Test", testSchema);

export default Test;