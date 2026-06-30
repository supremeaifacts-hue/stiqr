const mongoose = require('mongoose');

const PDFFileSchema = new mongoose.Schema({
  qrCodeId: { type: String, required: true, unique: true },
  originalName: { type: String },
  data: { type: Buffer, required: true }, // Store the actual PDF data
  size: { type: Number },
  status: { type: String, default: 'completed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PDFFile', PDFFileSchema);
