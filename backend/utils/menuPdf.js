function normalizePdfId(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined') return null;
  return str;
}

function normalizePdfUrl(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined' || str === '/menu/null' || str === 'menu/null') return '';
  return str;
}

function getMenuPdfLink(menuPage, req) {
  if (!menuPage) return '';

  const hostBase = `${req.protocol}://${req.get('host')}`;
  const directPdfUrl = normalizePdfUrl(menuPage.pdfUrl);
  const pdfFileId = normalizePdfId(menuPage.pdfFileId);

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
