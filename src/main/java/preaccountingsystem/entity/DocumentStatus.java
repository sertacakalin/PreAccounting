package preaccountingsystem.entity;

/**
 * Status of document processing
 */
public enum DocumentStatus {
    UPLOADED,      // File uploaded, not processed yet
    PROCESSING,    // OCR in progress
    PROCESSED,     // OCR completed successfully
    VERIFIED,      // User verified the extracted data
    ERROR          // Processing failed
}
