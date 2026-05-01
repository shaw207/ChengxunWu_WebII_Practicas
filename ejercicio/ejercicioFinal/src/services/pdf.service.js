import PDFDocument from 'pdfkit';

const writeField = (doc, label, value) => {
  doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
  doc.font('Helvetica').text(value || '-');
};

export const generateDeliveryNotePdf = async (deliveryNote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('Albaran BildyApp', { align: 'center' });
    doc.moveDown();

    writeField(doc, 'Cliente', deliveryNote.client?.name);
    writeField(doc, 'Proyecto', deliveryNote.project?.name);
    writeField(doc, 'Usuario', deliveryNote.user?.email);
    writeField(doc, 'Formato', deliveryNote.format);
    writeField(doc, 'Fecha de trabajo', deliveryNote.workDate?.toISOString?.().slice(0, 10));
    writeField(doc, 'Descripcion', deliveryNote.description);
    doc.moveDown();

    if (deliveryNote.format === 'material') {
      writeField(doc, 'Material', deliveryNote.material);
      writeField(doc, 'Cantidad', deliveryNote.quantity?.toString());
      writeField(doc, 'Unidad', deliveryNote.unit);
    }

    if (deliveryNote.format === 'hours') {
      writeField(doc, 'Horas', deliveryNote.hours?.toString());

      if (deliveryNote.workers?.length) {
        doc.moveDown();
        doc.font('Helvetica-Bold').text('Trabajadores');
        deliveryNote.workers.forEach((worker) => {
          doc.font('Helvetica').text(`- ${worker.name}: ${worker.hours}h`);
        });
      }
    }

    doc.moveDown();
    writeField(doc, 'Firmado', deliveryNote.signed ? 'Si' : 'No');
    writeField(doc, 'Fecha de firma', deliveryNote.signedAt?.toISOString?.() || '-');

    if (deliveryNote.signatureUrl) {
      writeField(doc, 'Firma', deliveryNote.signatureUrl);
    }

    doc.end();
  });
};
