package preaccountingsystem.entity;

/**
 * Enum representing the status of an inventory item.
 * ACTIVE: Item is available for use in transactions
 * PASSIVE: Item is disabled but remains visible in the list
 */
public enum ItemStatus {
    ACTIVE,   // Item is active and available for selection
    PASSIVE   // Item is inactive (disabled but still visible)
}
