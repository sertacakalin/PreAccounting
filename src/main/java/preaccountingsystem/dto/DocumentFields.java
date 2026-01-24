package preaccountingsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO representing extracted fields from a document
 * Includes confidence scores for each field
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentFields {

    // General fields (applicable to all document types)
    private String companyName;
    private Double companyNameConfidence;

    private String date;
    private Double dateConfidence;

    private String documentNumber;
    private Double documentNumberConfidence;

    private Double totalAmount;
    private Double totalAmountConfidence;

    private Double vatAmount;
    private Double vatAmountConfidence;

    private String currency;
    private Double currencyConfidence;

    // Invoice-specific fields
    private List<InvoiceItemData> items;

    // Additional fields
    private String taxId;
    private Double taxIdConfidence;

    private String address;
    private Double addressConfidence;

    private String description;
    private Double descriptionConfidence;

    // Overall confidence
    private Double overallConfidence;

    // Original OCR text for reference
    private String rawOcrText;
}
