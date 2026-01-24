package preaccountingsystem.entity;

/**
 * Types of documents that can be processed
 */
public enum DocumentType {
    INVOICE("Fatura"),
    RECEIPT("Fiş/Makbuz"),
    CONTRACT("Sözleşme"),
    BANK_STATEMENT("Banka Dekontu"),
    OTHER("Diğer");

    private final String displayName;

    DocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
