const mongoose = require('mongoose');

const PDFFileSchema = new mongoose.Schema({
  qrCodeId: { type: String, default: null },
  fileId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID (set after background processing)
  filename: { type: String },
  originalName: { type: String },
  filePath: { type: String }, // Temporary path on disk
  fileUrl: { type: String }, // Permanent URL after GridFS upload
  size: { type: Number },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PDFFile', PDFFileSchema);

