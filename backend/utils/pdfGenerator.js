const PDFDocument = require('pdfkit');

const getSectionName = (type) => {
  const typeMap = {
    'MCQ': 'SECTION A (MULTIPLE CHOICE QUESTIONS)',
    'TrueFalse': 'SECTION B (TRUE OR FALSE)',
    'ShortAnswer': 'SECTION C (SHORT ANSWER QUESTIONS)',
    'LongAnswer': 'SECTION D (LONG ANSWER / DESCRIPTIVE QUESTIONS)',
    'CaseStudy': 'SECTION E (CASE STUDY / ANALYTICAL QUESTIONS)',
    'Programming': 'SECTION F (PROGRAMMING & ALGORITHMIC QUESTIONS)'
  };
  return typeMap[type] || `${type.toUpperCase()} QUESTIONS`;
};

/**
 * Generates a PDF buffer for one paper set and streams it to the response
 */
const generatePaperPDF = (paper, set, res) => {
  const doc = new PDFDocument({ 
    margin: 50,
    bufferPages: true // Enable buffering to calculate total pages dynamically
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${paper.subject}-${set.setName}.pdf"`);

  doc.pipe(res);

  doc.moveDown(0.4);

  // --- Formal Exam Header ---
  doc.fontSize(13).font('Helvetica-Bold').text('COLLEGE OF ENGINEERING & TECHNOLOGY', { align: 'center' });
  doc.fontSize(10).font('Helvetica-Bold').text('DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING', { align: 'center' });
  doc.fontSize(11).font('Helvetica-Bold').text(`${(paper.examType || 'Term').toUpperCase()} EXAMINATION - 2026`, { align: 'center' });
  doc.moveDown(0.8);

  // --- Bounding Metadata Table Box ---
  const boxTop = doc.y;
  doc.rect(50, boxTop, 500, 75).stroke();
  
  // Divider Lines
  doc.moveTo(320, boxTop).lineTo(320, boxTop + 75).stroke(); // Vertical divider
  doc.moveTo(50, boxTop + 25).lineTo(550, boxTop + 25).stroke(); // Horizontal divider 1
  doc.moveTo(50, boxTop + 50).lineTo(550, boxTop + 50).stroke(); // Horizontal divider 2
  
  // Left Column Metadata
  doc.fontSize(9.5).font('Helvetica-Bold').text(`Subject: `, 55, boxTop + 8, { continued: true });
  doc.font('Helvetica').text(paper.subject || 'General Studies');
  
  doc.font('Helvetica-Bold').text(`Paper Title: `, 55, boxTop + 33, { continued: true });
  doc.font('Helvetica').text(paper.title || 'Examination Paper');
  
  doc.font('Helvetica-Bold').text(`Time Allowed: `, 55, boxTop + 58, { continued: true });
  doc.font('Helvetica').text(`${paper.durationMinutes || 180} Minutes`);
  
  // Right Column Metadata
  doc.fontSize(9.5).font('Helvetica-Bold').text(`Set Label: `, 325, boxTop + 8, { continued: true });
  doc.font('Helvetica').text(set.setName || 'Set A');
  
  doc.font('Helvetica-Bold').text(`Max Marks: `, 325, boxTop + 33, { continued: true });
  doc.font('Helvetica').text(`${paper.totalMarks || 100} Marks`);
  
  doc.font('Helvetica-Bold').text(`Roll No: `, 325, boxTop + 58, { continued: true });
  doc.font('Helvetica').text(`[_____________________]`);
  
  doc.y = boxTop + 75;
  doc.moveDown(1);

  // --- Candidate Instructions ---
  doc.fontSize(10).font('Helvetica-Bold').text('Instructions to Candidates:');
  doc.fontSize(9).font('Helvetica-Oblique');
  const instructions = [
    "1. Write your Roll Number clearly in the designated box provided above.",
    "2. Ensure you have received the correct question paper set matching your registration.",
    "3. All questions are compulsory. Marks are indicated on the right-hand side of each question.",
    "4. Illustrate your answers with clean diagrams or code blocks wherever applicable."
  ];
  instructions.forEach(ins => {
    doc.text(ins, 60, doc.y, { width: 480 });
    doc.moveDown(0.15);
  });
  
  doc.moveDown(0.4);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveTo(50, doc.y + 2).lineTo(550, doc.y + 2).stroke(); // Double Line separator
  doc.moveDown(0.8);

  // --- Grid Column Headers ---
  doc.fontSize(9.5).font('Helvetica-Bold');
  const headersY = doc.y;
  doc.text('Q.No.', 50, headersY, { width: 22, align: 'center' });
  doc.text('Questions', 78, headersY, { width: 410 });
  doc.text('Marks', 495, headersY, { width: 55, align: 'center' });
  doc.moveDown(0.35);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.6);

  const instructionsEndY = doc.y; // Where vertical grid lines begin

  // --- Questions List ---
  let questionNumber = 1;
  let currentType = null;

  set.questions.forEach((q) => {
    // Section Header Handling
    if (q.questionType !== currentType) {
      currentType = q.questionType;
      
      // Page break check for Section Header
      if (doc.y > doc.page.height - 120) {
        doc.addPage();
      } else {
        doc.moveDown(0.8);
      }
      
      const sectionName = getSectionName(currentType);
      doc.fontSize(11).font('Helvetica-Bold').text(sectionName, 78, doc.y);
      doc.moveDown(0.25);
      doc.moveTo(78, doc.y).lineTo(490, doc.y).stroke();
      doc.moveDown(0.65);
    } else {
      // General question separation spacing
      doc.moveDown(0.5);
    }

    // Page break check for Question Body
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }

    const startY = doc.y;
    
    // Render question number (left column)
    doc.fontSize(10).font('Helvetica-Bold').text(`${questionNumber}`, 50, startY, { width: 20, align: 'center' });

    // Render question title (center column)
    doc.fontSize(10.5).font('Helvetica').text(q.title, 78, startY, { width: 410 });
    const endY = doc.y;
    
    // Render marks (right column)
    doc.fontSize(9.5).font('Helvetica-Bold').text(`[${q.marks}]`, 495, startY, { width: 55, align: 'center' });
    
    doc.y = Math.max(endY, startY + 12);
    doc.moveDown(0.15);

    // Optional Question Description / Context / Code
    if (q.description && 
        !q.description.includes('Generated for subject') && 
        !q.description.includes('Generated for department') && 
        !q.description.includes('Auto-generated question')) {
      // Page break check for description
      if (doc.y > doc.page.height - 60) {
        doc.addPage();
      }
      doc.fontSize(9.5).font('Helvetica-Oblique').text(q.description, 78, doc.y, { width: 410 });
      doc.moveDown(0.2);
    }

    // MCQ Options formatting
    if (q.questionType === 'MCQ' && q.options && q.options.length > 0) {
      const optionLetters = ['A', 'B', 'C', 'D'];
      const hasLongOption = q.options.some(opt => opt.length > 35);
      
      // Page break check for options block
      const optionsHeight = hasLongOption ? (q.options.length * 15) : 30;
      if (doc.y > doc.page.height - (optionsHeight + 50)) {
        doc.addPage();
      }

      doc.fontSize(9.5).font('Helvetica');
      if (hasLongOption) {
        // Vertical list
        q.options.forEach((opt, idx) => {
          doc.text(`(${optionLetters[idx]}) ${opt}`, 85, doc.y, { width: 400 });
          doc.moveDown(0.1);
        });
      } else {
        // 2x2 Grid
        const y1 = doc.y;
        doc.text(`(A) ${q.options[0]}`, 85, y1, { width: 190 });
        doc.text(`(B) ${q.options[1]}`, 290, y1, { width: 190 });
        
        const y2 = doc.y + 12;
        doc.text(`(C) ${q.options[2]}`, 85, y2, { width: 190 });
        doc.text(`(D) ${q.options[3]}`, 290, y2, { width: 190 });
        doc.y = y2 + 12;
        doc.moveDown(0.15);
      }
    }

    questionNumber++;
  });

  // --- End of Paper Marker ---
  if (doc.y > doc.page.height - 60) {
    doc.addPage();
  }
  doc.moveDown(1.5);
  doc.fontSize(10).font('Helvetica-Bold').text('--- END OF QUESTION PAPER ---', { align: 'center' });

  // --- Dynamic Footers, Page Numbers, and Grid Lines ---
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Draw footer line
    doc.moveTo(50, doc.page.height - 50).lineTo(550, doc.page.height - 50).stroke();
    
    // Draw vertical column grid lines
    const startLineY = (i === 0) ? (instructionsEndY || 180) : 50;
    const endLineY = doc.page.height - 50;
    
    doc.lineWidth(0.5);
    doc.moveTo(72, startLineY).lineTo(72, endLineY).stroke();
    doc.moveTo(495, startLineY).lineTo(495, endLineY).stroke();
    doc.lineWidth(1.0); // Reset line width
    
    // Left: exam identifier
    doc.fontSize(8).font('Helvetica').text(
      `${paper.subject || 'General'} — ${(paper.examType || 'Term').toUpperCase()} (${set.setName})`,
      50,
      doc.page.height - 42,
      { width: 300 }
    );

    // Right: Page number
    doc.fontSize(8.5).font('Helvetica-Bold').text(
      `Page ${i + 1} of ${range.count}`,
      350,
      doc.page.height - 42,
      { align: 'right', width: 200 }
    );
  }

  doc.end();
};

module.exports = { generatePaperPDF };
