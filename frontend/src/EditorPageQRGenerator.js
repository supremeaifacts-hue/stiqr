import QRCode from 'qrcode';

export const useQRGenerator = ({
  qrData,
  qrColor,
  bgColor,
  qrSize,
  errorCorrectionLevel,
  includeMargin,
  selectedSticker,
  selectedLogo,
  selectedFrame,
  framePhrase,
  frameFont,
  frameColor,
  canvasRef
}) => {
  // This effect handles QR code generation and drawing
  const generateQRCode = () => {
    if (qrData && canvasRef.current) {
      // Set canvas dimensions - extend 250px down for the thicker bottom border
      const canvasWidth = qrSize;
      const canvasHeight = qrSize * 2 + 250; // Double height plus 250px extra for thicker border
      
      // Set canvas dimensions
      canvasRef.current.width = canvasWidth;
      canvasRef.current.height = canvasHeight;
      
      // Create 30px white area around QR code
      const whiteAreaPadding = 30;
      const qrWithWhiteAreaSize = qrSize - (whiteAreaPadding * 2);
      
      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: qrWithWhiteAreaSize,
          margin: includeMargin ? 2 : 0,
          color: {
            dark: qrColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorCorrectionLevel,
        },
        (error) => {
          if (error) {
            console.error('QR Code error:', error);
          } else {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            // Apply frame effects - only rectangle with rounded edges under QR code for "thick-under-text"
            if (selectedFrame !== 'none') {
              const frameConfigs = {};
              
              const config = frameConfigs[selectedFrame];
              if (config) {
                // For "thick-under-text", draw rectangle with rounded edges at center of QR code (same position as logo center, moved 10px left)
                if (selectedFrame === 'thick-under-text') {
                  const rectangleHeight = qrSize * 0.12;
                  const rectanglePadding = qrSize * 0.05;
                  const rectangleWidth = qrSize - (rectanglePadding * 2);
                  const rectangleRadius = rectangleHeight / 2;
                  const rectangleY = qrSize/2 - 25; // Same Y position as logo center (25px up from center)
                  const labelOffsetX = -10; // Move 10px to the left
                  
                  // Draw rectangle background with rounded edges (moved 10px left)
                  ctx.fillStyle = frameColor;
                  ctx.beginPath();
                  ctx.roundRect(rectanglePadding + labelOffsetX, rectangleY - rectangleHeight/2, rectangleWidth, rectangleHeight, rectangleRadius);
                  ctx.fill();
                  
                  // Draw white border around rectangle
                  ctx.strokeStyle = '#fff';
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.roundRect(rectanglePadding + labelOffsetX, rectangleY - rectangleHeight/2, rectangleWidth, rectangleHeight, rectangleRadius);
                  ctx.stroke();
                  
                  // Draw editable text inside rectangle (also moved 10px left)
                  ctx.fillStyle = '#fff';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.font = `${rectangleHeight * 0.4}px ${frameFont}`;
                  
                  const maxWidth = rectangleWidth * 0.9;
                  let text = framePhrase;
                  
                  // Truncate text if too long
                  const metrics = ctx.measureText(text);
                  if (metrics.width > maxWidth) {
                    while (text.length > 3 && ctx.measureText(text + '...').width > maxWidth) {
                      text = text.slice(0, -1);
                    }
                    text = text + '...';
                  }
                  
                  ctx.fillText(text, qrSize/2 + labelOffsetX, rectangleY);
                }
              }
              
              // Handle frame1 rendering
              if (selectedFrame === 'frame1') {
                // Frame #1 specifications (scaled proportionally with qrSize)
                const outerWidth = qrSize * 0.67; // When qrSize=300, outerWidth≈200px
                const qrTileSize = qrSize * 0.57; // When qrSize=300, qrTileSize≈172px
                const borderRadius = 14 * (qrSize / 300); // Scale border radius proportionally
                const qrAreaBorderRadius = 4 * (qrSize / 300); // Scale QR area border radius
                const paddingTop = 14 * (qrSize / 300);
                const paddingLeft = 14 * (qrSize / 300);
                const labelGap = 8 * (qrSize / 300);
                
                // Calculate total height including QR tile and label
                const totalHeight = paddingTop + qrTileSize + labelGap + (qrSize * 0.037 * 1.5); // Add space for text
                
                // Calculate positions to center the frame on canvas
                const frameX = (qrSize - outerWidth) / 2;
                const frameY = (qrSize - totalHeight) / 2;
                const qrTileX = frameX + paddingLeft;
                const qrTileY = frameY + paddingTop;
                
                // Draw black rounded rectangle background (outer container)
                ctx.fillStyle = '#000000'; // Fixed black background as per spec
                ctx.beginPath();
                ctx.roundRect(frameX, frameY, outerWidth, totalHeight, borderRadius);
                ctx.fill();
                
                // Draw white square inside for QR code
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.roundRect(qrTileX, qrTileY, qrTileSize, qrTileSize, qrAreaBorderRadius);
                ctx.fill();
                
                // Draw the editable text below the QR code
                const labelY = qrTileY + qrTileSize + labelGap;
                const labelFontSize = qrSize * 0.037; // When qrSize=300, font≈11px
                ctx.fillStyle = '#ffffff'; // White text as per spec
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.font = `bold ${labelFontSize}px ${frameFont}`; // Use selected frameFont
                
                // Truncate text if too long
                const maxWidth = outerWidth * 0.9;
                let text = framePhrase || 'SCAN ME';
                const metrics = ctx.measureText(text);
                
                if (metrics.width > maxWidth) {
                  while (text.length > 3 && ctx.measureText(text + '...').width > maxWidth) {
                    text = text.slice(0, -1);
                  }
                  text = text + '...';
                }
                
                // Apply letter spacing (2px when qrSize=300)
                const letterSpacing = 2 * (qrSize / 300);
                const textX = frameX + outerWidth / 2;
                
                // Draw text with letter spacing
                if (letterSpacing > 0) {
                  let currentX = textX - (metrics.width + (text.length - 1) * letterSpacing) / 2;
                  for (let i = 0; i < text.length; i++) {
                    ctx.fillText(text[i], currentX, labelY);
                    currentX += ctx.measureText(text[i]).width + letterSpacing;
                  }
                } else {
                  ctx.fillText(text, textX, labelY);
                }
              }
            }
            
            // Apply sticker if selected (positioned 3px right and 3px down from previous position)
            if (selectedSticker && canvasRef.current) {
              const stickerSize = qrSize * 0.2; // 20% of QR dimension
              const offset = 25; // 3px right and down from previous position: 25px up and left from center
              const x = (qrSize - stickerSize) / 2 - offset;
              const y = (qrSize - stickerSize) / 2 - offset;
              const padding = 6;
              // White square moved 3px right and 3px down
              const whiteSquareX = x - padding + 3;
              const whiteSquareY = y - padding + 3;
              ctx.fillStyle = 'white';
              const radius = 8;
              ctx.beginPath();
              ctx.moveTo(whiteSquareX + radius, whiteSquareY);
              ctx.lineTo(whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY);
              ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY, whiteSquareX + stickerSize + padding * 2, whiteSquareY + radius);
              ctx.lineTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2 - radius);
              ctx.quadraticCurveTo(whiteSquareX + stickerSize + padding * 2, whiteSquareY + stickerSize + padding * 2, whiteSquareX + stickerSize + padding * 2 - radius, whiteSquareY + stickerSize + padding * 2);
              ctx.lineTo(whiteSquareX + radius, whiteSquareY + stickerSize + padding * 2);
              ctx.quadraticCurveTo(whiteSquareX, whiteSquareY + stickerSize + padding * 2, whiteSquareX, whiteSquareY + stickerSize + padding * 2 - radius);
              ctx.lineTo(whiteSquareX, whiteSquareY + radius);
              ctx.quadraticCurveTo(whiteSquareX, whiteSquareY, whiteSquareX + radius, whiteSquareY);
              ctx.closePath();
              ctx.fill();

              // Sticker/logo moved 3px down
              const stickerX = x;
              const stickerY = y + 3;

              if (selectedSticker.startsWith('data:')) {
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, stickerX, stickerY, stickerSize, stickerSize);
                };
                img.src = selectedSticker;
              } else {
                ctx.font = `${stickerSize * 0.8}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#000';
                ctx.fillText(selectedSticker, stickerX + stickerSize/2, stickerY + stickerSize/2);
              }
            }
            
            // Apply logo if selected (scaled to 50x50px and positioned up-left)
            if (selectedLogo && canvasRef.current) {
              const logoSize = 50; // Fixed 50x50px size
              const offset = 25; // Move 25px up and left from center
              const x = (qrSize - logoSize) / 2 - offset;
              const y = (qrSize - logoSize) / 2 - offset;
              
              const img = new Image();
              img.onload = () => {
                // Draw white background for logo (moved 3px right and 3px down)
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.roundRect(x - 2 + 3, y - 2 + 3, logoSize + 4, logoSize + 4, 4);
                ctx.fill();
                
                // Draw the logo scaled to 50x50px (moved 3px down)
                ctx.drawImage(img, x, y + 3, logoSize, logoSize);
              };
              img.src = selectedLogo;
            }
          }
        }
      );
    }
  };

  return { generateQRCode };
};