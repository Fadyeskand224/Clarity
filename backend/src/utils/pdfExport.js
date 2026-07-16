import PDFDocument from 'pdfkit';
import { FAGERSTROM_DISCLAIMER } from './fagerstrom.js';

const TEAL = '#0f766e';
const INK = '#0b0b0b';
const MUTED = '#52514e';

export function buildClinicianPdf(data) {
  const { profile, streakDays, moneySaved, fagerstrom, medication, adherencePct, recentTriggers } = data;

  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Header
  doc.fillColor(TEAL).fontSize(22).font('Helvetica-Bold').text('Clarity — Clinician Summary');
  doc.moveDown(0.2);
  doc
    .fillColor(MUTED)
    .fontSize(9)
    .font('Helvetica')
    .text(`Generated ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`);
  doc.moveDown(1);
  rule(doc);

  // Quit overview
  section(doc, 'Quit Overview');
  const rows = [
    ['Quit date', new Date(profile.quit_date).toLocaleDateString('en-US', { dateStyle: 'long' })],
    ['Days smoke-free', String(streakDays)],
    ['Prior cigarettes/day', String(profile.cigarettes_per_day)],
    ['Money saved to date', `$${moneySaved.toFixed(2)}`],
  ];
  keyValueTable(doc, rows);
  doc.moveDown(0.8);

  // Fagerström
  section(doc, 'Fagerström Test for Nicotine Dependence');
  if (fagerstrom) {
    keyValueTable(doc, [
      ['Score', `${fagerstrom.score} / 10`],
      ['Dependence level', fagerstrom.dependence_level],
      ['Assessed on', new Date(fagerstrom.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })],
    ]);
    doc.moveDown(0.3);
    doc.fillColor(INK).fontSize(10).font('Helvetica-Bold').text('Clinical recommendation (informational, not prescriptive):');
    doc.fillColor(INK).fontSize(10).font('Helvetica').text(fagerstrom.recommendation, { width: 500 });
  } else {
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('No assessment completed yet.');
  }
  doc.moveDown(0.8);

  // Pharmacotherapy
  section(doc, 'Pharmacotherapy');
  if (medication) {
    keyValueTable(doc, [
      ['Current medication', `${medication.medication_name} (${medication.medication_type})`],
      ['Dose schedule', medication.dose_schedule],
      ['7-day adherence', `${adherencePct}%`],
    ]);
  } else {
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('No active medication regimen recorded.');
  }
  doc.moveDown(0.8);

  // Triggers
  section(doc, 'Recent Self-Reported Triggers');
  if (recentTriggers.length > 0) {
    recentTriggers.forEach((t) => {
      doc
        .fillColor(INK)
        .fontSize(10)
        .font('Helvetica')
        .text(`• ${new Date(t.occurred_at).toLocaleDateString('en-US', { dateStyle: 'medium' })} — ${t.trigger}${t.mood ? ` (mood: ${t.mood})` : ''}`);
    });
  } else {
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text('No journal entries logged yet.');
  }
  doc.moveDown(1.2);

  rule(doc);
  doc.moveDown(0.4);
  doc
    .fillColor(MUTED)
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text(
      `${FAGERSTROM_DISCLAIMER} All data in this summary is self-reported by the patient via the Clarity app and is intended to support, not replace, clinical assessment. CDC Quitline: 1-800-QUIT-NOW.`,
      { width: 500 }
    );

  doc.end();
  return done;
}

function section(doc, title) {
  doc.fillColor(TEAL).fontSize(13).font('Helvetica-Bold').text(title);
  doc.moveDown(0.3);
}

function keyValueTable(doc, rows) {
  rows.forEach(([label, value]) => {
    doc.fillColor(MUTED).fontSize(10).font('Helvetica').text(label, { continued: true, width: 500 });
    doc.fillColor(INK).font('Helvetica-Bold').text(`   ${value}`);
  });
}

function rule(doc) {
  const y = doc.y;
  doc
    .strokeColor('#e1e0d9')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(562, y)
    .stroke();
  doc.moveDown(0.6);
}
