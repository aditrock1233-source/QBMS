const PDFDocument = require('pdfkit');

/**
 * Generates a PDF buffer for one paper set and streams it to the response
 */
const generatePaperPDF = (paper, set, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${paper.subject}-${set.setName}.pdf"`);

  doc.pipe(res);

  // Header
  doc.fontSize(16).font('Helvetica-Bold').text(paper.title, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`${paper.subject} — ${set.setName}`, { align: 'center' });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .text(`Max Marks: ${paper.totalMarks}`, { continued: true })
    .text(`Time: ${paper.durationMinutes} Minutes`, { align: 'right' });
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);

  // Questions, grouped by section
  let questionNumber = 1;
  let currentType = null;

  set.questions.forEach((q) => {
    if (q.questionType !== currentType) {
      currentType = q.questionType;
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold').text(`${currentType} Questions`);
      doc.moveDown(0.3);
    }

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`${questionNumber}. ${q.title} [${q.marks} Marks]`);

    if (q.questionType === 'MCQ' && q.options && q.options.length > 0) {
      const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const optionLine = q.options
        .map((opt, idx) => `${optionLetters[idx]}. ${opt}`)
        .join('     ');
      doc.fontSize(10).text(optionLine, { indent: 20 });
    }

    doc.moveDown(0.5);
    questionNumber++;
  });

  doc.end();
};

module.exports = { generatePaperPDF };
