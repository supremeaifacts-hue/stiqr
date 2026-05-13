import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

/**
 * Custom hook for rendering QR code to canvas
 * @param {Object} params - Rendering parameters
 * @param {string} params.qrContent - The content to encode in QR code
 * @param {string} params.qrColor - Color of QR code modules
 * @param {string} params.bgColor - Background color
 * @param {number} params.qrSize - Size of QR code in pixels
 * @param {string} params.errorCorrectionLevel - Error correction level (L, M, Q, H)
 * @param {boolean} params.includeMargin - Whether to include margin
 * @param {string|null} params.selectedSticker - Selected sticker data URL or emoji
 * @param {string|null} params.selectedLogo - Selected logo data URL
 * @param {string} params.selectedFrame - Selected frame type ('none', 'frame1', 'frame2', 'frame3')
 * @param {string} params.frameColor - Color of the frame
 * @param {string} params.framePhrase - Text to display on frame
 * @param {string} params.frameFont - Font for frame text
 * @param {React.RefObject} canvasRef - Reference to canvas element
 */
export const useQRRenderer = ({
  qrContent,
  qrColor,
  bgColor,
  qrSize,
  errorCorrectionLevel,
  includeMargin,
  selectedSticker,
  selectedLogo,
  selectedFrame,
  frameColor,
  framePhrase,
  frameFont
}, canvasRef) => {
  useEffect(() => {
    const renderPreview = async () => {
      if (!canvasRef.current || !qrContent) return;

      const canvas = canvasRef.current;
      const canvasWidth = qrSize;
      const isFrame2Preview = selectedFrame === 'frame2';
      const isFrame3Preview = selectedFrame === 'frame3';
      const isFrame23Preview = isFrame2Preview || isFrame3Preview;
      const canvasHeight = qrSize;
      
      // Frame #2 specific measurements - keep canvas same size, draw frame within it
      const frame2OuterWidth = 200; // Original width
      const frame2PaddingTop = 14;
      const frame2PaddingRight = 14;
      const frame2PaddingBottom = 10;
      const frame2PaddingLeft = 14;
      const frame2QrAreaSize = 172; // Original QR size within frame
      const frame2BorderRadius = 14;
      const frame2QrAreaBorderRadius = 4;
      const frame2LabelGap = 8;
      const frame2TotalHeight = 236;
      
      // Calculate positions for frame #2
      const frame2X = (canvasWidth - frame2OuterWidth) / 2;
      const frame2Y = (canvasHeight - frame2TotalHeight) / 2;
      const frame2QrX = frame2X + frame2PaddingLeft;
      const frame2QrY = frame2Y + frame2PaddingTop;
      
      let qrRenderSize = qrSize - 60;
      let qrOffsetX = 30;
      let qrOffsetY = selectedFrame === 'frame2' ? 20 : 30;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (isFrame23Preview) {
        if (isFrame2Preview) {
          // Draw frame #2 with exact measurements
          ctx.fillStyle = frameColor;
          ctx.beginPath();
          ctx.roundRect(frame2X, frame2Y, frame2OuterWidth, frame2TotalHeight, frame2BorderRadius);
          ctx.fill();
          
          // Draw white QR area
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(frame2QrX, frame2QrY, frame2QrAreaSize, frame2QrAreaSize, frame2QrAreaBorderRadius);
          ctx.fill();
          
          // Update QR position for frame #2
          qrOffsetX = frame2QrX;
          qrOffsetY = frame2QrY;
          qrRenderSize = frame2QrAreaSize;
        } else {
          // Original frame 3 logic
          const frameX = 10;
          const frameY = 10;
          const frameWidth = canvasWidth - 20;
          const frameHeight = canvasHeight - 20;
          ctx.fillStyle = frameColor;
          ctx.beginPath();
          ctx.roundRect(frameX, frameY, frameWidth, frameHeight, 24);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(qrOffsetX, qrOffsetY, qrRenderSize, qrRenderSize, 16);
          ctx.fill();
        }
      }

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = qrRenderSize;
      tempCanvas.height = qrRenderSize;

      await new Promise((resolve, reject) => {
        QRCode.toCanvas(
          tempCanvas,
          qrContent,
          {
            width: qrRenderSize,
            margin: includeMargin ? 2 : 0,
            color: {
              dark: qrColor,
              light: bgColor,
            },
            errorCorrectionLevel: errorCorrectionLevel,
          },
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });

      // Apply frame effects - MUST be done BEFORE drawing QR code for frame1
      if (selectedFrame === 'frame1') {
        // Frame #1 specifications according to user requirements
        // All measurements scale with qrSize
        const padding = 14 * (qrSize / 300); // 14px when qrSize=300
        const bottomPadding = 30 * (qrSize / 300); // 30px extra at bottom for text
        const qrCodeMargin = 10 * (qrSize / 300); // 10px margin inside white square
        
        // Frame dimensions
        const frameWidth = qrSize + (padding * 2);
        const frameHeight = qrSize + padding + bottomPadding;
        const borderRadius = 14 * (qrSize / 300);
        const qrAreaBorderRadius = 4 * (qrSize / 300);
        
        // Position frame to be centered on canvas
        const frameX = (canvasWidth - frameWidth) / 2;
        const frameY = (canvasHeight - frameHeight) / 2;
        
        // White square position (where QR code goes)
        const whiteSquareX = frameX + padding;
        const whiteSquareY = frameY + padding;
        const whiteSquareSize = qrSize;
        
        // 1. Draw black rounded rectangle background (outer container)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(frameX, frameY, frameWidth, frameHeight, borderRadius);
        ctx.fill();
        
        // 2. Draw white square inside for QR code
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(whiteSquareX, whiteSquareY, whiteSquareSize, whiteSquareSize, qrAreaBorderRadius);
        ctx.fill();
        
        // 3. Update QR code position to be inside white square with margin
        qrOffsetX = whiteSquareX + qrCodeMargin;
        qrOffsetY = whiteSquareY + qrCodeMargin;
        qrRenderSize = qrSize - (qrCodeMargin * 2);
      }

      ctx.drawImage(tempCanvas, qrOffsetX, qrOffsetY);

      // Draw text for frame1
        ctx.fillStyle = '#ffffff'; // White text as per spec
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = `bold ${labelFontSize}px Arial`; // Bold 700 as per spec
        
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

      // Apply sticker if selected (centered on the QR area)
      if (selectedSticker) {
        const stickerSize = qrSize * 0.2; // 20% of QR dimension
        const padding = 6;
        const totalBackgroundSize = stickerSize + 2 * padding; // Include padding in centering calculation
        const x = qrOffsetX + (qrRenderSize - totalBackgroundSize) / 2;
        const y = qrOffsetY + (qrRenderSize - totalBackgroundSize) / 2;
        // White square moved 3px right and 3px down
        const whiteSquareX = x + 3;
        const whiteSquareY = y + 3;
        ctx.fillStyle = 'white';
        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(whiteSquareX + radius, whiteSquareY);
        ctx.lineTo(whiteSquareX + totalBackgroundSize - radius, whiteSquareY);
        ctx.quadraticCurveTo(whiteSquareX + totalBackgroundSize, whiteSquareY, whiteSquareX + totalBackgroundSize, whiteSquareY + radius);
        ctx.lineTo(whiteSquareX + totalBackgroundSize, whiteSquareY + totalBackgroundSize - radius);
        ctx.quadraticCurveTo(whiteSquareX + totalBackgroundSize, whiteSquareY + totalBackgroundSize, whiteSquareX + totalBackgroundSize - radius, whiteSquareY + totalBackgroundSize);
        ctx.lineTo(whiteSquareX + radius, whiteSquareY + totalBackgroundSize);
        ctx.quadraticCurveTo(whiteSquareX, whiteSquareY + totalBackgroundSize, whiteSquareX, whiteSquareY + totalBackgroundSize - radius);
        ctx.lineTo(whiteSquareX, whiteSquareY + radius);
        ctx.quadraticCurveTo(whiteSquareX, whiteSquareY, whiteSquareX + radius, whiteSquareY);
        ctx.closePath();
        ctx.fill();

        // Position sticker in center of background (moved 3px down)
        const stickerX = x + padding;
        const stickerY = y + padding + 3;

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
          ctx.fillText(selectedSticker, stickerX + stickerSize / 2, stickerY + stickerSize / 2);
        }
      }

      // Apply logo if selected (centered on the QR area)
      if (selectedLogo) {
        const logoSize = 50; // Fixed 50x50px size
        const x = qrOffsetX + (qrRenderSize - logoSize) / 2;
        const y = qrOffsetY + (qrRenderSize - logoSize) / 2;

        const img = new Image();
        img.onload = () => {
          // Draw white background for logo (moved 3px right and 3px down)
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.roundRect(x - 2 + 3, y - 2 + 3, logoSize + 4, logoSize + 4, 4);
          ctx.fill();
          // Draw the logo (moved 3px down)
          ctx.drawImage(img, x, y + 3, logoSize, logoSize);
        };
        img.src = selectedLogo;
      }
    };

    renderPreview().catch((error) => {
      console.error('Failed to render QR preview:', error);
    });
  }, [
    qrContent, qrColor, bgColor, qrSize, errorCorrectionLevel, includeMargin,
    selectedSticker, selectedLogo, selectedFrame, framePhrase, frameFont, frameColor,
    canvasRef
  ]);
};

/**
 * Component that renders QR code preview canvas
 */
export const QRPreview = ({ 
  qrContent,
  qrColor = '#000000',
  bgColor = '#ffffff',
  qrSize = 280,
  errorCorrectionLevel = 'H',
  includeMargin = true,
  selectedSticker = null,
  selectedLogo = null,
  selectedFrame = 'none',
  frameColor = '#000000',
  framePhrase = 'SCAN ME',
  frameFont = 'Arial',
  style = {}
}) => {
  const canvasRef = useRef(null);

  useQRRenderer({
    qrContent,
    qrColor,
    bgColor,
    qrSize,
    errorCorrectionLevel,
    includeMargin,
    selectedSticker,
    selectedLogo,
    selectedFrame,
    frameColor,
    framePhrase,
    frameFont
  }, canvasRef);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '311px',
        aspectRatio: '1 / 1',
        height: 'auto',
        borderRadius: '16px',
        background: '#ffffff',
        ...style
      }}
    />
  );
};

export default QRPreview;