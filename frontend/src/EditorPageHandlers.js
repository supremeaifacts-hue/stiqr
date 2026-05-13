import QRCode from 'qrcode';

export const useEditorPageHandlers = ({
  isAuthenticated,
  saveLogo,
  saveQrCode,
  selectedLogo,
  setSelectedLogo,
  qrData,
  canvasRef,
  qrSize,
  includeMargin,
  qrColor,
  bgColor,
  errorCorrectionLevel,
  selectedFrame,
  frameColor,
  frameFont,
  framePhrase,
  selectedSticker,
  qrCodeToEdit
}) => {
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (PNG, JPG, JPEG, or SVG)');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const logoData = event.target.result;
        setSelectedLogo(logoData);
        
        // Save logo to backend if user is authenticated
        if (isAuthenticated) {
          try {
            await saveLogo(logoData, file.name);
            console.log('Logo saved to user account');
          } catch (error) {
            console.error('Failed to save logo:', error);
            // Continue anyway - the logo will still be selected
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (canvasRef.current && qrData) {
      // First save QR code to get scan URL (if authenticated)
      let scanUrl = qrData; // Default to original data
      let savedQrCode = null;
      
      if (isAuthenticated) {
        try {
          // Generate current QR code image
          const imageData = canvasRef.current.toDataURL('image/png');
          
          // Save QR code to backend
          savedQrCode = await saveQrCode(qrData, imageData, `QR Code ${new Date().toLocaleDateString()}`);
          console.log('QR code saved to user account:', savedQrCode);
          
          // Use scan URL from backend response if available
          if (savedQrCode && savedQrCode.qrCode && savedQrCode.qrCode.scanUrl) {
            scanUrl = savedQrCode.qrCode.scanUrl;
            console.log('Using scan URL:', scanUrl);
          }
        } catch (error) {
          console.error('Failed to save QR code:', error);
          // Continue with original data
        }
      }
      
      // Generate QR code with scan URL (or original data if not authenticated/saved)
      const canvas = document.createElement('canvas');
      canvas.width = qrSize;
      canvas.height = qrSize * 2 + 250; // Same dimensions as preview
      
      // Generate QR code with scan URL
      await new Promise((resolve, reject) => {
        QRCode.toCanvas(
          canvas,
          scanUrl,
          {
            width: qrSize - 60, // Account for white area padding
            margin: includeMargin ? 2 : 0,
            color: {
              dark: qrColor,
              light: bgColor,
            },
            errorCorrectionLevel: errorCorrectionLevel,
          },
          (error) => {
            if (error) {
              console.error('QR Code generation error:', error);
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });
      
      // Apply same customizations as preview
      const ctx = canvas.getContext('2d');
      
      // Apply frame effects
      if (selectedFrame !== 'none') {
        const frameConfigs = {};
        
        const config = frameConfigs[selectedFrame];
        if (config && selectedFrame === 'thick-under-text') {
          const rectangleHeight = qrSize * 0.12;
          const rectanglePadding = qrSize * 0.05;
          const rectangleWidth = qrSize - (rectanglePadding * 2);
          const rectangleRadius = rectangleHeight / 2;
          const rectangleY = qrSize/2 - 25;
          const labelOffsetX = -10;
          
          // Draw rectangle background with rounded edges
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
          
          // Draw editable text inside rectangle
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
        
        // Handle frame1 rendering for download
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
      
      // Apply sticker if selected
      if (selectedSticker) {
        const stickerSize = qrSize * 0.2;
        const offset = 25;
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

        // Sticker moved 3px down
        const stickerX = x;
        const stickerY = y + 3;

        if (selectedSticker.startsWith('data:')) {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, stickerX, stickerY, stickerSize, stickerSize);
              resolve();
            };
            img.onerror = reject;
            img.src = selectedSticker;
          });
        } else {
          ctx.font = `${stickerSize * 0.8}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#000';
          ctx.fillText(selectedSticker, stickerX + stickerSize/2, stickerY + stickerSize/2);
        }
      }
      
      // Apply logo if selected
      if (selectedLogo) {
        const logoSize = 50;
        const offset = 25;
        const x = (qrSize - logoSize) / 2 - offset;
        const y = (qrSize - logoSize) / 2 - offset;
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = () => {
            // Draw white background for logo (moved 3px right and 3px down)
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.roundRect(x - 2 + 3, y - 2 + 3, logoSize + 4, logoSize + 4, 4);
            ctx.fill();
            
            // Draw the logo (moved 3px down)
            ctx.drawImage(img, x, y + 3, logoSize, logoSize);
            resolve();
          };
          img.onerror = reject;
          img.src = selectedLogo;
        });
      }
      
      // Download the QR code
      const finalImageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = finalImageData;
      link.download = `qrcode_${Date.now()}.png`;
      link.click();
      
      // If we saved the QR code but didn't get a scan URL (demo mode or error),
      // we should update the saved QR code with the final image
      if (isAuthenticated && savedQrCode && savedQrCode.qrCode && !savedQrCode.qrCode.scanUrl) {
        try {
          // The QR code was saved but we need to update it with the final image
          // (This would require an update endpoint, but for now we'll just log)
          console.log('QR code saved without scan URL (demo mode?)');
        } catch (error) {
          console.error('Failed to update QR code image:', error);
        }
      }
    }
  };

  const handleSaveToCollection = async (canvasRef, qrData, qrColor, bgColor, selectedFrame, frameColor, frameFont, framePhrase, selectedSticker, selectedLogo, errorCorrectionLevel, qrMode, selectedType, includeMargin, qrSize, isAuthenticated, saveQrCode, qrCodeToEdit) => {
    if (!isAuthenticated) {
      alert('Please login to save QR codes to your collection');
      return;
    }
    
    if (!qrData) {
      alert('Please create a QR code first');
      return;
    }
    
    try {
      // Generate current QR code image
      const imageData = canvasRef.current.toDataURL('image/png');
      
      // Create design characteristics object
      const designCharacteristics = {
        qrColor,
        bgColor,
        selectedFrame,
        frameColor,
        frameFont,
        framePhrase,
        selectedSticker,
        selectedLogo,
        errorCorrectionLevel,
        qrMode,
        selectedType,
        includeMargin,
        qrSize
      };
      
      // Check if we're editing an existing QR code
      const isEditing = qrCodeToEdit && qrCodeToEdit.id;
      
      // Save QR code to backend with design characteristics
      const savedQrCode = await saveQrCode(
        qrData, 
        imageData, 
        framePhrase || `QR Code ${new Date().toLocaleDateString()}`,
        designCharacteristics
      );
      console.log('QR code saved to user account:', savedQrCode);
      
      if (isEditing) {
        alert(`QR code "${framePhrase || 'Untitled QR Code'}" updated successfully!\n\nThe modified QR code has overwritten the old version in your Dashboard > My QR codes.`);
      } else {
        alert('QR code saved to your collection! You can find it in Dashboard > My QR codes.');
      }
      
    } catch (error) {
      console.error('Failed to save QR code:', error);
      alert('Failed to save QR code. Please try again.');
    }
  };

  return {
    handleLogoUpload,
    handleDownload,
    handleSaveToCollection
  };
};