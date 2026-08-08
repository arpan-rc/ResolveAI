import jsPDF from 'jspdf';
import { Ticket, AuditLog } from '../types';

export function isFinancialTicket(ticket: Ticket): boolean {
  if (ticket.category === 'Billing') return true;
  const fullText = `${ticket.subject} ${ticket.description}`.toLowerCase();
  return /(₹|\$|usd|inr|charge|invoice|refund|payment|fee|credit card|debit|price)/i.test(fullText);
}

export function generateInvoicePDF(ticket: Ticket, auditLogs?: AuditLog[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isFinancial = isFinancialTicket(ticket);
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('RESOLVEAI', 15, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(129, 140, 248); // indigo-400
  doc.text(
    isFinancial
      ? 'CUSTOMER SUPPORT INVOICE & SERVICE RECORD'
      : 'OFFICIAL CUSTOMER SUPPORT RESOLUTION RECORD',
    15,
    y + 7
  );

  // Right-aligned Document Badge
  const docNum = isFinancial
    ? `INV-${ticket.id.replace('TCK-', '')}-${new Date(ticket.createdAt).getTime().toString().slice(-4)}`
    : `RES-${ticket.id.replace('TCK-', '')}-${new Date(ticket.createdAt).getTime().toString().slice(-4)}`;
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${isFinancial ? 'INVOICE #' : 'DOCUMENT #'}: ${docNum}`, pageWidth - 15, y, { align: 'right' });
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - 15, y + 6, { align: 'right' });

  y = 42;

  // Section 1: Metadata Grid
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(15, y, pageWidth - 30, 28, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59); // slate-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  // Column 1
  doc.text('CUSTOMER DETAILS', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Name: ${ticket.customerName}`, 20, y + 13);
  doc.text(`Email: ${ticket.customerEmail}`, 20, y + 19);

  // Column 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TICKET METADATA', 115, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Ticket ID: #${ticket.id}`, 115, y + 13);
  doc.text(`Submitted: ${new Date(ticket.createdAt).toLocaleString()}`, 115, y + 19);

  y += 36;

  // Section 2: Ticket Summary Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SUPPORT REQUEST DETAILS', 15, y);
  y += 5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, pageWidth - 30, 36, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Subject:', 20, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(ticket.subject, 38, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Category:', 20, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${ticket.category}  |  Priority: ${ticket.priority}  |  Department: ${ticket.department}`, 38, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Description:', 20, y + 21);
  doc.setFont('helvetica', 'normal');
  const splitDesc = doc.splitTextToSize(ticket.description, pageWidth - 60);
  doc.text(splitDesc.slice(0, 2), 38, y + 21);

  y += 44;

  // Section 3: Resolution Response
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('RESOLUTION & ACTION TAKEN', 15, y);
  y += 5;

  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, pageWidth - 30, 38, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Status:', 20, y + 7);

  let statusLabel = ticket.status as string;
  if (ticket.status === 'APPROVED' || ticket.status === 'EDITED_APPROVED') statusLabel = 'RESOLVED & DISPATCHED';
  else if (ticket.status === 'AWAITING_HUMAN_REVIEW') statusLabel = 'IN REVIEW BY HUMAN AGENT';

  doc.setTextColor(16, 185, 129); // emerald
  doc.text(statusLabel, 35, y + 7);

  doc.setTextColor(30, 41, 59);
  doc.text('Reviewed By:', 115, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(ticket.humanReview?.reviewer || 'ResolveAI Automated Agent Triage System', 140, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Official Response:', 20, y + 15);
  doc.setFont('helvetica', 'normal');

  const responseText = ticket.humanReview?.finalResponse || ticket.aiAnalysis?.draftResponse || 'Your support ticket has been recorded and is currently being processed by our support engineering team.';
  const splitResponse = doc.splitTextToSize(responseText, pageWidth - 45);
  doc.text(splitResponse.slice(0, 3), 20, y + 21);

  y += 46;

  // Section 4: Charges / Financial Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('SERVICE CHARGE & FINANCIAL SUMMARY', 15, y);
  y += 5;

  // Detect financial charge in description/subject
  const fullText = `${ticket.subject} ${ticket.description}`;
  const currencyMatch = fullText.match(/(₹|\$|USD|INR)\s?[\d,]+(\.\d{2})?/gi);
  const financialAmount = currencyMatch ? currencyMatch[0] : null;

  doc.setFillColor(15, 23, 42);
  doc.rect(15, y, pageWidth - 30, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Item / Service Description', 20, y + 5.5);
  doc.text('Category', 115, y + 5.5);
  doc.text('Amount / Adjustment', pageWidth - 20, y + 5.5, { align: 'right' });

  y += 8;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(15, y, pageWidth - 30, 14, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  if (financialAmount) {
    doc.text(`Support Inquiry / Financial Adjustment: ${ticket.subject.slice(0, 40)}`, 20, y + 8);
    doc.text(ticket.category, 115, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(financialAmount, pageWidth - 20, y + 8, { align: 'right' });
  } else {
    doc.text(`Customer Service & Support Ticket Resolution (#${ticket.id})`, 20, y + 8);
    doc.text(ticket.category, 115, y + 8);
    doc.setFont('helvetica', 'bold');
    doc.text('0.00 (Standard Support)', pageWidth - 20, y + 8, { align: 'right' });
  }

  y += 24;

  // Footer Sign-Off
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, pageWidth - 15, y);

  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('This is an electronically generated official support resolution invoice and record from ResolveAI.', 15, y);
  doc.text('Human-in-the-Loop AI Automation Platform — All actions logged and verified.', 15, y + 4);

  // Download trigger
  const fileName = `ResolveAI_Invoice_${ticket.id}.pdf`;
  doc.save(fileName);
}
