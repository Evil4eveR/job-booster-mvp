import { Document, Packer, Paragraph, TextRun } from 'docx';

class DocxService {
  async generateA4Buffer(coverLetterData) {
    try {
      // تفكيك البيانات القادمة من قاعدة البيانات أو الـ API
      const cl = coverLetterData.coverLetter || {};
      const bodyParagraphs = Array.isArray(cl.bodyParagraphs) ? cl.bodyParagraphs : [];

      // بناء مستند Word احترافي متوافق مع معايير الشركات وعناصر التنسيق
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // بيانات المرسل (Sender) في الأعلى
            new Paragraph({ children: [new TextRun({ text: cl.senderName || "Yassin Marmoud", bold: true, size: 24, font: "Arial" })] }),
            new Paragraph({ children: [new TextRun({ text: cl.senderContact || "", size: 20, font: "Arial" })] }),
            new Paragraph({ text: "" }), // سطر فارغ للفصل
            
            // التاريخ الحالي متموضع جهة اليمين تلقائياً طبقاً لمعيار DIN 5008
            new Paragraph({ 
              children: [new TextRun({ text: new Date().toLocaleDateString('de-DE'), size: 22, font: "Arial" })],
              alignment: "right"
            }),
            new Paragraph({ text: "" }),
            
            // بيانات المستلم والشركة (Recipient)
            new Paragraph({ children: [new TextRun({ text: cl.recipientCompany || "", italic: true, size: 22, font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            
            // موضوع الرسالة (Subject Line) - يجب أن يكون عريضاً وواضحاً
            new Paragraph({ children: [new TextRun({ text: cl.subjectLine || "Betreff: Bewerbung", bold: true, size: 26, font: "Arial" })] }),
            new Paragraph({ text: "" }),
            
            // التحية الرسمية (Salutation)
            new Paragraph({ children: [new TextRun({ text: cl.salutation || "Sehr geehrte Damen und Herren,", size: 22, font: "Arial" })] }),
            new Paragraph({ text: "" }),
            
            // إضافة فقرات نص الرسالة ديناميكياً مع مسافات متباعدة ومريحة للقراءة
            ...bodyParagraphs.map(paragraphText => new Paragraph({
              children: [new TextRun({ text: paragraphText, size: 22, font: "Arial" })],
              spacing: { after: 240 } // مسافة أمان بعد كل فقرة لمنع التكدس
            })),
            
            new Paragraph({ text: "" }),
            
            // التوقيع الختامي (Sign-off)
            new Paragraph({ children: [new TextRun({ text: cl.signOff || "Mit freundlichen Grüßen,", size: 22, font: "Arial" })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: cl.senderName || "Yassin Marmoud", bold: true, size: 22, font: "Arial" })] }),
          ],
        }],
      });

      // تحويل المستند البرمجي إلى Buffer بايتات جاهزة للإرسال عبر الشبكة
      const docxBuffer = await Packer.toBuffer(doc);
      return docxBuffer;
    } catch (error) {
      console.error('DOCX Engine Generation Failure:', error);
      throw new Error('Failed to compile document asset into DOCX format.');
    }
  }
}

export default new DocxService();