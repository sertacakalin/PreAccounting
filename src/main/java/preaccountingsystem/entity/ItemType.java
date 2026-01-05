package preaccountingsystem.entity;

/**
 * Enum representing the type of an inventory item.
 * PRODUCT: Physical goods that can be stocked
 * SERVICE: Non-physical items (services) that cannot be stocked
 */
public enum ItemType {
    PRODUCT,  // Physical products with stock tracking
    SERVICE   // Services without stock tracking
}
