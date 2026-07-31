# Application Product Structure

Using the `aware` workflow, this summary is based on inspected repository files.

## UI Entry Point

[Verified] The main UI entry point is:

- `los-ui-quantum/src/views/applications/products/ApplicationProducts.vue`

[Verified] It is routed from:

- `los-ui-quantum/src/router/routes/routesApplications.ts`

Route details:

```text
link: /applications/:appId/products/:appProductId?
routeName: applications-products
pageId: 1-10-0-0-0
groupName: applications/products
component: ApplicationProducts
```

## UI Product Area

[Verified] The Application Product UI area is split across:

```text
los-ui-quantum/src/views/applications/products/
  ApplicationProducts.vue              main list/detail page
  application-products.ts              product service/composable logic
  application-products-state.ts        shared product page state
  application-products-config.ts       section ids, lookup maps, types
  ProductDetailsForm.vue               LOSForm_v2 Product Detail section
  ProductMargins.vue                   rate/margin calculation UI
  ProductFeeDrawer.vue                 add/edit product fees drawer
  ProductFeaturesForm.vue              product feature section
  ProductFunderUpfrontsForm.vue        funder upfront section
  ProductLendingPurposeList.vue        lending purpose list
  ProductLendingPurposeDrawer.vue      add/edit lending purpose drawer
  ProductSupplementaryCardHolderForms.vue
```

[Verified] The page has a list mode and a detail mode. Detail mode uses collapsible sections:

```text
0 Product Detail
1 Supplementary Card Holder(s)     conditional on product definition
2 Product Features
3 Product Fees
4 Margins
5 Funder Upfronts
6 Lending Purpose
```

## UI Section Configuration

[Verified] Shared page config is in:

- `los-ui-quantum/src/views/applications/products/application-products-config.ts`

Important identifiers:

```text
pageId: 1-10-0-0-0
tableApplicationProductsId: tableApplicationProducts
tableAppProductFeesId: tableAppProductFees
productsDetailSectionId: 1-10-0-0-0_1
supplementaryCardHoldersSectionId: 1-10-0-0-0_2
productFeaturesSectionId: 1-10-0-0-0_3
productFeesSectionId: 1-10-0-0-0_4
lendingPurposeSectionId: 1-10-0-0-0_5
marginsSectionId: 1-10-0-0-0_6
discountRateSectionId: 1-10-0-0-0_7
funderUpfrontsSectionId: 1-10-0-0-0_8
```

## API Structure

[Verified] The Application Product API structure is under:

```text
los-api-quantum/LW.Los.Api/Modules/Applications/
  Endpoints/ApplicationProduct/
  Commands/ApplicationProduct/
  Queries/ApplicationProduct/
  Core/ApplicationProduct/
```

[Verified] The core API model is:

- `los-api-quantum/LW.Los.Api/Modules/Applications/Core/ApplicationProduct/AppProduct.cs`

This maps to `tblAppProduct`. `InsertAppProduct` and `UpdateAppProduct` extend `AppProductCore`.

## API Routes

[Verified] Main API routes are registered in:

- `los-api-quantum/LW.Los.Api/Modules/Applications/ApplicationsModule.cs`

Important routes:

```text
GET    /applications/{appId}/products
GET    /applications/products/{appProductId}
POST   /applications/{appId}/products
PUT    /applications/products/{appProductId}
DELETE /applications/product/{appProductId}
PATCH  /applications/products/{appProductId}/borrower-rate
```

## Database Persistence

[Verified] Persistence is stored-procedure based. Key sprocs include:

```text
USP_GetAppProducts
sp_appProductAdd_API
sp_appProductUpdate_API
USP_API_AppProductDelete
usp_AppProduct_Calculations
sp_AppProduct_GetInclusions
sp_GetAppProductFees
```

## Working Flow

[Inference] The Application Product flow is:

```text
Route -> ApplicationProducts.vue
  -> useAppProducts()
    -> page state/config
    -> los-api endpoints for app-product records, fees, inclusions, repayments
    -> management-api /products for product definitions and margin rates
  -> API endpoint
    -> CQRS command/query
    -> stored procedure
    -> tblAppProduct and related product tables
```

## Verification

No files were modified during the initial investigation. This document was added afterward at the workspace root.
