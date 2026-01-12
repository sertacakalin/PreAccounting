package preaccountingsystem.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import preaccountingsystem.dto.InvoiceDto;
import preaccountingsystem.dto.InvoiceItemDto;
import preaccountingsystem.exception.BusinessException;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class InvoicePdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generateInvoicePdf(InvoiceDto invoice) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Title
            document.add(new Paragraph("INVOICE")
                    .setFontSize(24)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("\n"));

            // Invoice details
            document.add(new Paragraph("Invoice Number: " + invoice.getInvoiceNumber())
                    .setFontSize(12));
            document.add(new Paragraph("Date: " + invoice.getInvoiceDate().format(DATE_FORMATTER))
                    .setFontSize(12));
            document.add(new Paragraph("Due Date: " + invoice.getDueDate().format(DATE_FORMATTER))
                    .setFontSize(12));
            document.add(new Paragraph("Status: " + invoice.getStatus())
                    .setFontSize(12));

            document.add(new Paragraph("\n"));

            // Customer/Supplier info
            document.add(new Paragraph("INCOME".equals(invoice.getType()) ? "Bill To:" : "Supplier:")
                    .setFontSize(14)
                    .setBold());
            document.add(new Paragraph(invoice.getCustomerSupplierName())
                    .setFontSize(12));

            document.add(new Paragraph("\n"));

            // Items table
            Table table = new Table(UnitValue.createPercentArray(new float[]{4, 1, 2, 2}));
            table.setWidth(UnitValue.createPercentValue(100));

            // Header
            table.addHeaderCell("Description");
            table.addHeaderCell("Qty");
            table.addHeaderCell("Unit Price");
            table.addHeaderCell("Amount");

            // Items
            BigDecimal subtotal = BigDecimal.ZERO;

            for (InvoiceItemDto item : invoice.getItems()) {
                table.addCell(item.getDescription() != null ? item.getDescription() : "");
                table.addCell(item.getQuantity() != null ? item.getQuantity().toString() : "0");
                table.addCell(String.format("%.2f %s",
                    item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO,
                    invoice.getCurrency()));
                table.addCell(String.format("%.2f %s",
                    item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO,
                    invoice.getCurrency()));

                if (item.getAmount() != null) {
                    subtotal = subtotal.add(item.getAmount());
                }
            }

            document.add(table);
            document.add(new Paragraph("\n"));

            // Totals
            document.add(new Paragraph("Total: " + String.format("%.2f %s",
                invoice.getTotalAmount() != null ? invoice.getTotalAmount() : subtotal,
                invoice.getCurrency()))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setFontSize(14)
                    .setBold());

            // Notes
            if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
                document.add(new Paragraph("\n"));
                document.add(new Paragraph("Notes:")
                        .setFontSize(12)
                        .setBold());
                document.add(new Paragraph(invoice.getNotes())
                        .setFontSize(10));
            }

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new BusinessException("Failed to generate PDF: " + e.getMessage());
        }
    }
}
