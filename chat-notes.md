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

### Purchase Orders (Stock In)

- دەتوانن داواکاری کڕین (Purchase) دروست بکەن:
  - supplier (بازاڕ/چیناوە)
  - item ـەکان بە variant (product_spec_id)
  - quantity + unit cost
  - کۆی تێچوو خۆکار هەژمار دەکرێت
- کاتێک کاڵاکە گەیشت:
  - لە purchase details دوگمەی Receive All هەیە → بە یەک کلیک:
    - stock زیاد دەکات
    - stock_movements (type=purchase) تۆمار دەکات
    - purchase_price ـی variant دەکاتە unit cost ـی ئەو کڕینە

Files:
- Frontend page: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/src/pages/purchases/PurchasesPage.jsx`
- Route: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/src/App.jsx`
- Sidebar link: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/src/layouts/DashboardLayout.jsx`

Backend:
- Controller: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/backend/controllers/PurchaseController.php`
- Routes: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/backend/routes/api.php`

API (CRUD):
- **Create**: `POST /api/purchases`
  - body: `{ supplier_name, note?, status?: 'draft'|'ordered', items: [{ product_spec_id, quantity, unit_cost }] }`
  - server computes `total_cost = SUM(unit_cost * quantity)`
- **Read (List)**: `GET /api/purchases?status=ordered`
- **Read (Details)**: `GET /api/purchases?id=ID`
- **Update (Receive stock)**: `PATCH /api/purchases/receive?id=ID`
  - adds remaining quantities to `product_specifications.stock`
  - writes `stock_movements` with `type='purchase'`
  - sets `product_specifications.purchase_price = unit_cost`
  - marks purchase status as `received`

DB:
- Tables added to schema: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/backend/database/schema.sql`
  - `purchase_orders`
  - `purchase_order_items`

SQL (create tables):
```sql
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    status ENUM('draft','ordered','partial','received','cancelled') DEFAULT 'ordered',
    total_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    note TEXT,
    created_by_user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_spec_id INT NOT NULL,
    quantity INT NOT NULL,
    received_quantity INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_spec_id) REFERENCES product_specifications(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Dashboard (Stock Summary)

Backend (Dashboard summary):
- Endpoint: `GET /api/dashboard/summary`
- New fields:
  - `stock_products` = ژمارەی product ـەکان کە stock > 0 هەیە
  - `stock_units` = کۆی دانەکان (SUM(stock))
  - `stock_value_cost` = کۆی نرخ بە نرخِ کڕین (purchase)
  - `stock_value_sale` = کۆی نرخ بە نرخِ فرۆشتن (promo/variant current)
- File: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/backend/controllers/DashboardController.php`

Frontend (Dashboard cards):
- 4 cards added:
  - Stock Products
  - Stock Units
  - Stock Value (Cost)
  - Stock Value (Sale)
- File: `/Applications/XAMPP/xamppfiles/htdocs/medlan-dashboard/src/pages/dashboard/DashboardHome.jsx`

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
