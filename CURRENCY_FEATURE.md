# Currency Management Feature

## Overview
The Pre-Accounting System now supports multi-currency transactions with live exchange rates from ExchangeRate-API.

## Features

### Backend
- **Currency Entity**: Supports multiple currencies (USD, EUR, GBP, TRY, JPY, CHF, CAD, AUD)
- **Exchange Rate Entity**: Stores historical exchange rates with high precision (20,10)
- **Live API Integration**: Fetches real-time exchange rates from ExchangeRate-API
- **Currency Fields**: Added to Invoice, Payment, and IncomeExpense entities
- **Auto-initialization**: Default currencies are created on first startup

### API Endpoints

#### Currency Management
- `GET /api/currencies` - Get all active currencies
- `GET /api/currencies/all` - Get all currencies (Admin only)
- `POST /api/currencies` - Create new currency (Admin only)
- `PATCH /api/currencies/{id}/status` - Update currency status (Admin only)

#### Exchange Rates
- `POST /api/currencies/rates/update/{baseCurrency}` - Update rates for a currency (Admin only)
- `POST /api/currencies/rates/update-all` - Update all exchange rates (Admin only)
- `GET /api/currencies/rate?from=USD&to=EUR&date=2025-01-01` - Get exchange rate
- `GET /api/currencies/convert?from=USD&to=EUR&amount=100&date=2025-01-01` - Convert amount

### Configuration

Add to `application.yml` or set as environment variables:

```yaml
currency:
  api:
    key: "YOUR_API_KEY_HERE" # Optional - leave empty for free API
    base-url: "https://v6.exchangerate-api.com/v6"
```

**Get your free API key**: https://www.exchangerate-api.com/
- Free tier: 1,500 requests/month
- No credit card required

### Database Schema

#### Currencies Table
```sql
CREATE TABLE currencies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Exchange Rates Table
```sql
CREATE TABLE exchange_rates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(20,10) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE (from_currency, to_currency, rate_date)
);
```

### Updated Entities

All transaction entities now include a `currency` field:

```java
@Column(name = "currency", nullable = false, length = 3)
@Builder.Default
private String currency = "USD";
```

- **Invoice**: Currency field added, defaults to USD
- **Payment**: Currency field added, defaults to USD
- **IncomeExpense**: Currency field added, defaults to USD

### Usage Examples

#### Create Invoice with Currency
```json
POST /api/invoices
{
  "invoiceDate": "2025-01-01",
  "dueDate": "2025-02-01",
  "currency": "EUR",
  "customerSupplierId": 1,
  "items": [...]
}
```

#### Convert Currency
```bash
curl "http://localhost:8081/api/currencies/convert?from=USD&to=TRY&amount=1000"
```

Response:
```json
{
  "fromCurrency": "USD",
  "toCurrency": "TRY",
  "amount": 1000,
  "convertedAmount": 32450.50,
  "exchangeRate": 32.45050,
  "rateDate": "2025-01-01"
}
```

#### Update Exchange Rates (Admin)
```bash
curl -X POST http://localhost:8081/api/currencies/rates/update-all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Default Currencies

The system initializes with 8 common currencies:

| Code | Name | Symbol |
|------|------|--------|
| USD | US Dollar | $ |
| EUR | Euro | € |
| GBP | British Pound | £ |
| TRY | Turkish Lira | ₺ |
| JPY | Japanese Yen | ¥ |
| CHF | Swiss Franc | CHF |
| CAD | Canadian Dollar | C$ |
| AUD | Australian Dollar | A$ |

### Frontend Integration

Currency selectors will be added to:
- Invoice creation/edit forms
- Payment creation/edit forms
- Income/Expense creation/edit forms
- Dashboard currency display

### Error Handling

- Invalid currency codes are rejected with validation errors
- Missing exchange rates trigger API fetch
- Failed API calls fall back to cached rates
- Currency mismatches are prevented in payment-invoice linking

### Best Practices

1. **Update rates regularly**: Schedule a cron job to update exchange rates daily
2. **Cache rates**: Rates are automatically cached in the database
3. **Use ISO codes**: Always use 3-letter ISO 4217 currency codes (USD, EUR, etc.)
4. **Validate amounts**: Ensure amount-currency pairs are consistent in transactions
5. **Monitor API usage**: Free tier allows 1,500 requests/month

### Migration Notes

Existing data will default to USD currency. To update:

```sql
-- Update existing invoices
UPDATE invoices SET currency = 'EUR' WHERE company_id IN (SELECT id FROM customers WHERE country = 'Germany');

-- Update existing payments
UPDATE payments SET currency = 'GBP' WHERE company_id IN (SELECT id FROM customers WHERE country = 'UK');
```

### Future Enhancements

- Multi-currency reporting and dashboards
- Currency conversion at transaction time
- Historical rate charts
- Automatic rate updates via scheduler
- Support for crypto currencies
- Custom exchange rate overrides
