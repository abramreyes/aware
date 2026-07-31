# Application Product Structure

Application Product is spread across UI, API, and DB.

## Main Structure

- UI route: `/applications/:appId/products/:appProductId?` maps to `ApplicationProducts` in `los-ui-quantum/src/router/routes/routesApplications.ts`.
- UI implementation lives under `los-ui-quantum/src/views/applications/products`:
  - `ApplicationProducts.vue`
  - `application-products.ts`
  - `application-products-state.ts`
  - `application-products-config.ts`
  - product detail, features, fees, margins, lending purpose, funder upfronts, supplementary card holder components.

## API Structure

- The LOS API Applications module exposes product endpoints under `/applications/.../products...` in `los-api-quantum/LW.Los.Api/Modules/Applications/ApplicationsModule.cs`.
- API folders:
  - `Endpoints/ApplicationProduct`
  - `Commands/ApplicationProduct`
  - `Queries/ApplicationProduct`
  - `Core/ApplicationProduct`

## Key API Areas

- Read products: `GET /applications/{appId}/products`, `GET /applications/products/{appProductId}`
- Create/update/delete: `POST /applications/{appId}/products`, `PUT /applications/products/{appProductId}`, delete endpoints
- Related pieces: fees, costs, inclusions, features, borrower rate, repayment calculation, credit score, supplementary card holders, program list.

## DB Layer

- Main legacy entity is `tblAppProduct`; API models use the `AppProduct` naming convention.
- Related SQL includes procedures like:
  - `USP_GetAppProducts`
  - `sp_appProductAdd_API`
  - `sp_appProductUpdate_API`
  - `USP_API_AppProductDelete`
  - `usp_AppProduct_Calculations`
  - `USP_AppProductFeature_AddUpdate`
  - `usp_ApplicationProduct_SupplementaryCardHolder_*`

The API calls these from command/query handlers, for example `GetAppProductByAppID.cs` and `InsertAppProductCommand.cs`.

The practical structure is:

```text
Vue page/composable/state/config
-> /applications/products API endpoints
-> CQRS command/query handlers
-> RepoDb/stored procedures
-> tblAppProduct and related product/cost/feature tables
```
