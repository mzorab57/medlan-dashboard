# Medlan Notes (Chat History Summary)

Date: 2026-01-21

## Projects & Workspace

- Frontend: `/Users/macbookshop/Documents/medlan-dashboard`
- Backend: `/Applications/XAMPP/xamppfiles/htdocs/medlan-backend`
- Multi-root workspace file:
  - `/Users/macbookshop/Documents/medlan-dashboard/medlan-fullstack.code-workspace`

## Frontend (Done)

### Orders

- City display in Order Details for “Customer pays” (infer from address if needed).
- Order-level discount UI in Order Details:
  - Discount is queued locally.
  - Discount request is sent only when status becomes `completed`.
- Item-level discount via per-item Unit Price override inside Create Order cart.
  - Unit price is clamped: purchase_price ≤ unit price ≤ promo price.
  - Does not change the real variant price in DB.

### Expenses

- Added expense category `discount` in UI.

### Sales Report

- Added columns for Order Discount and Net Profit in report UI/CSV.

## Backend / DB (What Must Be Applied)

### A) Apply item-level `unit_price` in OrderController::create()

File:
- `/Applications/XAMPP/xamppfiles/htdocs/medlan-backend/controllers/OrderController.php`

Location:
- Inside `create()` loop, replace lines:
  - L198-L203 (finalPrice/origPrice/discountAmount/cost/promoId/productId)
  - with the provided block that:
    - reads `unit_price` from request item
    - validates: purchase ≤ unit_price ≤ promo
    - sets `order_items.price` to unit_price
    - recalculates `discount_amount`

### B) Apply order-level discount only at `completed`

Already present in backend:
- `updateStatus()` has logic to apply `order_discount` when status becomes `completed`.

DB migration (if not applied yet):
```sql
ALTER TABLE orders
  ADD COLUMN order_discount DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE expenses
  ADD COLUMN order_id INT NULL;

ALTER TABLE expenses
  ADD CONSTRAINT fk_expenses_order_id
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

CREATE INDEX idx_expenses_order_id ON expenses(order_id);
```

## Important Limitation (Current Session)

- In this current assistant session, automatic write/edit to `/Applications/XAMPP/...` is not available.
- You can still keep this chat and apply the backend change by:
  - Editing that file directly in the IDE (manual paste), or
  - Opening a separate assistant session with the backend folder as the main workspace root.
