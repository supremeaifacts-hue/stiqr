const assert = require('assert');
const { getMenuPdfLink } = require('../utils/menuPdf');

const menuPage = {
  id: 'menu-123',
  pdfFileId: 'pdf-456',
  pdfFileName: 'menu.pdf',
  pdfFile: null
};

const req = {
  protocol: 'https',
  get: () => 'www.stiqr.top',
  hostname: 'www.stiqr.top'
};

const link = getMenuPdfLink(menuPage, req);
assert.strictEqual(link, 'https://www.stiqr.top/api/pdf/pdf-456');
console.log('menu PDF link test passed:', link);
