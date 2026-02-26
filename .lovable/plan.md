

## Plan: Product Reporting System

### 1. Database Migration

Create a `product_reports` table:

```sql
CREATE TABLE public.product_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  description text NOT NULL,
  reporter_contact text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, reporter_id)
);

ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

-- Users can only insert (not read/update/delete)
CREATE POLICY "Users can create reports"
  ON public.product_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can read all reports
CREATE POLICY "Admins can view all reports"
  ON public.product_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update reports (e.g. change status)
CREATE POLICY "Admins can update reports"
  ON public.product_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

### 2. New Files to Create

**`src/pages/ReportProduct.tsx`** - Report submission page
- Header with back navigation
- Product info summary at top (image, title, price)
- Reason selector (Radio group or Select): Counterfeit/Fake, Listing Discrepancy, Fraudulent Activity, Prohibited Item, Suspicious Pricing, Other
- Description textarea (required)
- Contact info field (optional)
- Submit button
- On success: show success state with "Back to product" button
- On error: show error state with "Try again" button
- Uses `useWorldApp` to get `user.id` as `reporter_id`

**`src/hooks/useCreateReport.ts`** - Mutation hook to insert report

**`src/pages/admin/AdminReportDetail.tsx`** - Admin view of a single report
- Full report details: reason, description, reporter name (from `public_profiles`), reporter contact
- Product info card
- "Suspend Product" button that opens existing `SuspendProductDialog`

**`src/components/admin/ReportsTable.tsx`** - Admin table of reports
- Columns: product image, product name, seller, category, price, report reason, report date
- Clicking a row navigates to `/admin/reports/:id`
- Fetches from `product_reports` joined with `products_with_sellers` and `public_profiles`

**`src/hooks/useAdminReports.ts`** - Hook to fetch reports with product/seller data (admin only)

**`src/hooks/useAdminReportDetail.ts`** - Hook to fetch single report detail

### 3. Files to Modify

**`src/pages/ProductDetail.tsx`**
- Add a "Report Product" link/button below the CTA buttons, styled subtly (e.g. `variant="ghost"` with `text-xs text-muted-foreground`)
- Navigates to `/report-product/:id`
- Also fix the build error: remove references to `product.seller.worldAppUsername` (this property doesn't exist on the Product type — use `product.seller.username` or fetch it separately)

**`src/pages/admin/AdminListings.tsx`**
- Replace direct `ProductsTable` render with a tabbed view using `Tabs` component
- Tab 1: "Product Listings" → renders `ProductsTable`
- Tab 2: "Product Reports" → renders `ReportsTable`

**`src/App.tsx`**
- Add routes:
  - `/report-product/:id` → `ReportProduct`
  - `/admin/reports/:id` → `AdminReportDetail`

### 4. UI Details

**Report Product button on ProductDetail** (below CTA):
```
<div className="px-4 py-2 flex justify-center">
  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground"
    onClick={() => navigate(`/report-product/${id}`)}>
    <Flag size={14} className="mr-1" /> Report this product
  </Button>
</div>
```

**Report submission page success state**:
- Checkmark icon, "Report Submitted" heading, brief message, "Back to Product" button

**Report submission page error state**:
- Error icon, message, "Try Again" button

**Admin Listings page with tabs**:
```
┌──────────────────────────────────┐
│ ← Product Listings               │
├──────────────────────────────────┤
│ [Listings]  [Reports]            │  ← Tabs
├──────────────────────────────────┤
│  (content based on active tab)   │
└──────────────────────────────────┘
```

### 5. Fix Build Errors

In `ProductDetail.tsx`, the `worldAppUsername` property is accessed on lines 96 and 109 but doesn't exist on the `Product.seller` type. The `products_with_sellers` view has `world_app_username` but it's not mapped in `transformDbProductToProduct`. Fix by:
- Adding `worldAppUsername` to the `Product.seller` type in `src/types/Product.ts`
- Mapping `dbProduct.world_app_username` in `transformDbProductToProduct` in `src/hooks/useProducts.ts`

### Files Summary

| File | Action |
|------|--------|
| DB migration | CREATE `product_reports` table with RLS |
| `src/types/Product.ts` | ADD `worldAppUsername` to seller type |
| `src/hooks/useProducts.ts` | MAP `world_app_username` in transform |
| `src/pages/ReportProduct.tsx` | CREATE report submission page |
| `src/hooks/useCreateReport.ts` | CREATE mutation hook |
| `src/components/admin/ReportsTable.tsx` | CREATE admin reports table |
| `src/hooks/useAdminReports.ts` | CREATE admin reports fetch hook |
| `src/hooks/useAdminReportDetail.ts` | CREATE single report fetch hook |
| `src/pages/admin/AdminReportDetail.tsx` | CREATE admin report detail page |
| `src/pages/admin/AdminListings.tsx` | EDIT - add tabs for listings/reports |
| `src/pages/ProductDetail.tsx` | EDIT - add report button |
| `src/App.tsx` | EDIT - add new routes |

