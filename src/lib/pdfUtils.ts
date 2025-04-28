
import { jsPDF } from "jspdf";
import type { ClassifyImageOutput, QuestionnaireData } from "@/ai/flows/classify-image";
import { format } from 'date-fns';

/**
 * Generates a PDF report from skin analysis results.
 *
 * @param result - The AI analysis output.
 * @param questionnaireData - The user's questionnaire answers.
 * @param imageUri - The data URI of the analyzed image.
 * @returns A jsPDF document instance.
 */
export const generatePdfReport = (
    result: ClassifyImageOutput,
    questionnaireData: QuestionnaireData | null,
    imageUri: string
): jsPDF => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let currentY = margin + 10; // Starting Y position with margin

    // --- Helper function for adding text with page break check ---
    const addTextWithWrap = (text: string, x: number, y: number, maxWidth: number, options?: any): number => {
        const lines = doc.splitTextToSize(text, maxWidth);
        // Calculate text height more accurately
        const fontSize = doc.getFontSize();
        const lineHeightFactor = doc.getLineHeightFactor();
        const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;

        if (y + textHeight > pageHeight - margin) {
            doc.addPage();
            y = margin + 10; // Reset Y on new page
        }
        doc.text(lines, x, y, options);
        // Add padding based on font size
        return y + textHeight + (fontSize * 0.3); // Return new Y position with padding
    };

    // --- Helper function for adding a separator line ---
    const addSeparator = (y: number): number => {
        if (y > pageHeight - margin - 5) { // Add buffer before separator
            doc.addPage();
            y = margin + 10;
        }
        doc.setDrawColor(200); // Light grey line
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
        return y + 4; // Return new Y position with padding
    };

    // --- Header ---
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold'); // Use standard font
    doc.text("Skin Analysis Report", pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100); // Muted color
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, pageWidth / 2, currentY, { align: 'center' });
    doc.setTextColor(0); // Reset color
    currentY += 15;

    // --- Patient Information ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Patient Information", margin, currentY);
    currentY += 5;
    currentY = addSeparator(currentY);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const infoMaxWidth = pageWidth - margin * 2 - 5; // Max width for info text

    if (questionnaireData) {
        currentY = addTextWithWrap(`Age: ${questionnaireData.age ?? 'Not Provided'}`, margin + 5, currentY, infoMaxWidth);
        currentY = addTextWithWrap(`Gender: ${questionnaireData.gender ?? 'Not Provided'}`, margin + 5, currentY, infoMaxWidth);
        currentY = addTextWithWrap(`Complexion: ${questionnaireData.complexion ?? 'Not Provided'}`, margin + 5, currentY, infoMaxWidth);
        currentY = addTextWithWrap(`Reported Symptoms: ${questionnaireData.symptoms ?? 'Not Provided'}`, margin + 5, currentY, infoMaxWidth);
        currentY = addTextWithWrap(`Current Products Used: ${questionnaireData.products || 'Not Provided'}`, margin + 5, currentY, infoMaxWidth);
    } else {
        currentY = addTextWithWrap('Questionnaire data not provided.', margin + 5, currentY, infoMaxWidth);
    }
    currentY += 5; // Extra space

    // --- Analysis Results ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("AI Analysis Results", margin, currentY);
    currentY += 5;
    currentY = addSeparator(currentY);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Bolding only the label part
    doc.setFont('helvetica', 'bold');
    doc.text('Predicted Condition:', margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    currentY = addTextWithWrap(result.predictedDisease || "N/A", margin + 5 + 40, currentY, infoMaxWidth - 40); // Adjust x for value

    doc.setFont('helvetica', 'bold');
    doc.text('Confidence Score:', margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    currentY = addTextWithWrap(`${result.confidencePercentage?.toFixed(1) ?? 'N/A'}%`, margin + 5 + 40, currentY, infoMaxWidth - 40); // Handle potential undefined

    doc.setFont('helvetica', 'bold');
    doc.text('AI Notes:', margin + 5, currentY);
    doc.setFont('helvetica', 'normal');
    currentY = addTextWithWrap(result.notes || 'None', margin + 5 + 40, currentY, infoMaxWidth - 40); // Use fallback if notes undefined
    currentY += 5;

    // --- Uploaded Image ---
     if (currentY > pageHeight - 90) { // Increased buffer for image section
        doc.addPage();
        currentY = margin + 10;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Uploaded Image", margin, currentY);
    currentY += 5;
    currentY = addSeparator(currentY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11); // Reset font size

    try {
        // Center the image, max width/height 80mm, maintain aspect ratio
        const imgProps = doc.getImageProperties(imageUri);
        const maxWidth = 80;
        const maxHeight = 80;
        let imgWidth = imgProps.width;
        let imgHeight = imgProps.height;
        const ratio = imgWidth / imgHeight;

        if (imgWidth > maxWidth) {
            imgWidth = maxWidth;
            imgHeight = imgWidth / ratio;
        }
        if (imgHeight > maxHeight) {
            imgHeight = maxHeight;
            imgWidth = imgHeight * ratio;
        }

         // Ensure image width doesn't exceed available page width after centering attempt
         imgWidth = Math.min(imgWidth, pageWidth - 2 * margin);
         imgHeight = imgWidth / ratio; // Recalculate height based on potentially adjusted width


        const imgX = (pageWidth - imgWidth) / 2;

        if (currentY + imgHeight > pageHeight - margin - 10) { // Check if image fits with footer buffer
            doc.addPage();
            currentY = margin + 10; // Reset Y on new page for the image
        }
        doc.addImage(imageUri, imgProps.fileType, imgX, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
    } catch (error) {
        console.error("Error adding image to PDF:", error);
        if (currentY > pageHeight - margin - 20) { // Check space for error message
            doc.addPage();
            currentY = margin + 10;
        }
        doc.setTextColor(255, 0, 0); // Red color for error
        currentY = addTextWithWrap("Error: Could not load the uploaded image into the PDF.", margin, currentY, pageWidth - margin * 2);
        doc.setTextColor(0); // Reset color
    }


     // --- Disclaimer ---
    // Ensure disclaimer is always at the bottom or on a new page if needed
    const disclaimer = "Disclaimer: This report is generated by an AI assistant for informational purposes only and does not constitute a medical diagnosis. It is crucial to consult a qualified healthcare professional (e.g., dermatologist) for an accurate diagnosis, treatment plan, and any medical advice.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
     const disclaimerHeight = disclaimerLines.length * (doc.getFontSize() * doc.getLineHeightFactor() / doc.internal.scaleFactor);
    if (currentY + disclaimerHeight + 10 > pageHeight - margin) { // Check if disclaimer fits with buffer
        doc.addPage();
        currentY = margin + 10;
    }
    currentY = addSeparator(currentY);
    doc.setFontSize(9);
    doc.setTextColor(150); // Grey color
    currentY = addTextWithWrap(disclaimer, margin, currentY, pageWidth - margin * 2, { fontStyle: 'italic' });
    doc.setTextColor(0); // Reset color


    // --- Footer (Page Number) ---
    const pageCount = doc.getNumberOfPages(); // Use the correct method name
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Position footer at the bottom margin
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - margin + 5, { align: 'right' });
    }

    return doc;
};

// Utility function to view the PDF in a new tab using data URI or jsPDF object
export const viewPdf = (pdfSource: jsPDF | string) => {
    const pdfDataUri = typeof pdfSource === 'string' ? pdfSource : pdfSource.output('datauristring');
    const pdfWindow = window.open("");
    if (pdfWindow) {
        pdfWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SkinSewa Report Preview</title>
                <style>
                    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                    iframe { border: none; width: 100%; height: 100%; }
                </style>
            </head>
            <body>
                <iframe src='${pdfDataUri}'></iframe>
            </body>
            </html>
        `);
        pdfWindow.document.close(); // Important for some browsers
    } else {
        alert("Could not open PDF viewer. Please ensure popups are allowed for this site."); // More user-friendly alert
    }
};

// Utility function to download the PDF using data URI
export const downloadPdf = (pdfDataUri: string, filename: string = "SkinSewa_Report.pdf") => {
  try {
    const link = document.createElement('a');
    link.href = pdfDataUri;
    link.download = filename;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Failed to download the PDF report. Please try again.");
  }
};

    