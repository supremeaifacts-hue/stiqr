const mongoose = require('mongoose');

const PDFFileSchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  qrCodeId: { type: String, default: null },
  filename: { type: String, required: true },
  originalName: { type: String },
  fileUrl: { type: String },
  size: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PDFFile', PDFFileSchema);
