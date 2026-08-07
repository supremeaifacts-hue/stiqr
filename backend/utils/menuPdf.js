function getMenuPdfLink(menuPage, req) {
  if (!menuPage) return '';

  const hostBase = `${req.protocol}://${req.get('host')}`;
  const directPdfUrl = menuPage.pdfUrl || '';
  const pdfFileId = menuPage.pdfFileId;

  if (directPdfUrl && (directPdfUrl.startsWith('http://') || directPdfUrl.startsWith('https://') || directPdfUrl.includes('/api/pdf/'))) {
    return directPdfUrl;
  }

  if (pdfFileId) {
    return `${hostBase}/api/pdf/${pdfFileId}`;
  }

  const pdfFile = menuPage.pdfFile || '';
  if (pdfFile && (pdfFile.startsWith('http://') || pdfFile.startsWith('https://') || pdfFile.includes('/api/pdf/'))) {
    return pdfFile;
  }

  if (pdfFile && pdfFile.startsWith('/uploads/')) {
    return `${hostBase}/api/pdf-by-path?path=${encodeURIComponent(pdfFile)}`;
  }

  if (pdfFile || menuPage.pdfFileName || (typeof pdfFile === 'string' && pdfFile.startsWith('data:')) || Buffer.isBuffer(pdfFile)) {
    return `${hostBase}/api/menu-pdf/${menuPage.id}`;
  }

  return '';
}

module.exports = {
  getMenuPdfLink
};
