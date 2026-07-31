# Disbursement Workflow

This note documents the Disbursement flow traced with the `aware` workflow.

## Application Page

The user-facing application page is routed in `los-ui-quantum`:

- `src/router/routes/routesApplications.ts`
- route: `/applications/:appId/disbursements`
- route name: `applications-disbursements`
- page id: `1-17-0-0-0`
- component: `ApplicationDisbursements`

The main implementation is:

- `los-ui-quantum/src/views/applications/ApplicationDisbursements.vue`

The page loads all disbursement rows from:

```text
GET /applications/{appId}/disbursements/fees
```

The response is held in `allDisbursements` and split into display groups:

- system disbursements: `system === 1`, excluding liability rows
- manual disbursements: `system === 0`, excluding liability rows
- liabilities paid out: rows with a liability id and `payoutOnSettlement` of `1` or `3`
- loan amount: a system disbursement where `disbursementTypeLookupName === "Loan Amount"`

The page also loads:

- product fees from `/applications/{appId}/products/fees?legalCode=-5&valuationCode=-5`
- application fees/costs from `/applications/{appId}/products/costs`
- application products from `/applications/{appId}/products?includeFeatures=false`
- disbursement type options from the management API
- cheque type and source-of-payment lookup data

## UI Actions

Manual add/edit/delete is immediate:

- add manual disbursement: `POST /applications/{appId}/disbursements`
- edit manual disbursement: `PUT /applications/{appId}/disbursements/{payeeId}`
- delete manual disbursement: `DELETE /applications/{appId}/disbursements/{payeeId}`

The add/edit drawer submits an `InsertFundsDisbursementTO`-shaped payload. The UI sets:

- `applicationID = activeAppId`
- `liabilityId = -1`
- `appLoanPurposeId = -1`
- `manualUpdated = 1`

Retained checkboxes and the "This Loan" / Balance of Funds settings are local until the user clicks Save. Save performs:

```text
PUT /applications/disbursements/{payeeId}/retained
POST /applications/{appId}/disbursements/recalculate
```

The retained update is sent once per disbursement with a `payeeId`.

## Permissions

The UI enables Add Disbursement only when the user has:

```text
APP_CAN_ADD_DISBURSEMENT
```

The API add/update/delete/recalculate endpoints require the disbursement submenu permission and the same add-disbursement task permission.

## LOS API

The LOS API maps application disbursement routes in:

- `los-api-quantum/LW.Los.Api/Modules/Applications/ApplicationsModule.cs`

Relevant endpoints:

```text
GET    /applications/disbursements/{payeeId}
GET    /applications/{appId}/disbursements/fees
POST   /applications/{appId}/disbursements
POST   /applications/{appId}/disbursements/recalculate
PUT    /applications/{appId}/disbursements/{payeeId}
PUT    /applications/disbursements/{payeeId}/retained
DELETE /applications/{appId}/disbursements/{payeeId}
```

The endpoint classes are thin Minimal API handlers. They set route values such as `appId` and `payeeId`, add the current user id, and send MediatR commands/queries.

## API To Database Contract

The core API-to-database calls are:

- read rows: `sp_DisbursementFee_Get`
- add payee/disbursement: `USP_DM_Payee_Add`
- update payee/disbursement: `USP_DM_Payee_Update`
- update retained flag: `USP_DM_Payee_Update_Retained`
- recalculate totals: `USP_DM_Recalculate_Total`
- delete payee/disbursement: `USP_DM_Payee_Delete`

The relevant command/query handlers are under:

- `los-api-quantum/LW.Los.Api/Modules/Applications/Queries/Disbursements`
- `los-api-quantum/LW.Los.Api/Modules/Applications/Commands/Disbursements`
- `los-api-quantum/LW.Los.Api/Modules/Applications/Commands/FundsDisbursementTO`

The main API DTOs are under:

- `los-api-quantum/LW.Los.Api/Modules/Applications/Core/Disbursements`
- `los-api-quantum/LW.Los.Api/Modules/Applications/Core/FundsDisbursementTO`

`DisbursementFees` maps the display/read shape, including:

- app id
- payee id
- disbursement type and label
- amount, GST, paid/payable amounts
- BSB/account details
- liability, fee, loan purpose, valuation, and security links
- retained/manual/system flags
- property purchase funds and base loan flags
- construction/payment reference data
- optional product-fee linkage metadata

## Database Read Behavior

The read procedure is:

- `los-db-quantum/sprocs/sp_DisbursementFee_Get.sql`

It builds `#tblDisbursement` from `tblAppDisbursements`, joining:

- `tblAppDisbursementMain`
- `tblDisbursementTypeLookup`
- `tblAppLiability`
- loan purpose tables
- valuation/security/address tables
- `tblFees`
- `tblAppCost`

It derives the display label from the row context:

- liability rows use liability type and institution
- loan-purpose rows append `(Cash Out)`
- loan amount rows display as `This {Funder} Loan`
- normal type rows use `tblDisbursementTypeLookup.cDisbursementType`
- valuation/security rows append property/security context

Important filters:

- inactive disbursement types are excluded with `dtl.iActive = 1`
- zero disbursement amount rows are deleted from the temp table
- reverted construction payment disbursements are removed
- final "all" mode dedupes by `iPayeeID`

`@cType` can return subsets:

- `L`: liabilities
- `S`: system generated
- `M`: manually added
- otherwise all rows

## Add And Update Behavior

The add procedure is:

- `los-db-quantum/sprocs/USP_DM_Payee_Add.sql`

The update procedure is:

- `los-db-quantum/sprocs/USP_DM_Payee_Update.sql`

Both procedures return immediately when `fDisbursementAmount` is zero.

Manual rows (`iManualUpdated = 1`) take the retained default from `tblDisbursementTypeLookup.iRetained`.

Non-manual/system-driven rows can auto-populate:

- `iLinkedAppProductID` from the main product
- BSB/account number from the selected disbursement type

Add inserts into `tblAppDisbursements`, assigns the output `iPayeeID`, optionally returns linked fee/product metadata, and calls `USP_DM_Recalculate_Total`.

Update changes the existing `tblAppDisbursements` row by `iPayeeID`, resets retained from the disbursement type default, optionally returns linked fee/product metadata, and calls `USP_DM_Recalculate_Total`.

## Recalculation

The recalculation procedure is:

- `los-db-quantum/sprocs/USP_DM_Recalculate_Total.sql`

It calculates:

- source total from `tblAppProduct.fAPAmount`
- base loan amount from the `Loan Amount` disbursement type
- total disbursements excluding base loan amount plus property purchase funds
- retained total
- disbursed total
- balance of funds

If the account type is `1`, retained total is included in disbursed total.

The calculated values are persisted through:

- `USP_DM_Save_Disbursements`

## Negative Balance Alert

The Disbursements page has page id:

```text
1-17-0-0-0
```

The UI updates the side-nav alert count through `refreshDisbursementPageAlert()` when the local balance changes through page events.

The database also raises the persisted alert in:

- `los-db-quantum/sprocs/USP_GetApplicationAlerts.sql`

The DB alert logic mirrors the frontend balance-of-funds formula and raises `DisbursementsNegativeBalance` when the calculated balance is negative.

## Disbursement Type Settings

Disbursement types are configured in `los-ui-quantum`:

- `src/views/settings/system/finance/DisbursementsSettings.vue`

The management API routes are in:

- `los-management-api-quantum/LW.Los.Management.Api/ManagementModule.cs`

Routes:

```text
GET    /disbursements/types
POST   /disbursements/types
PUT    /disbursements/types/{disbursementTypeId}
DELETE /disbursements/types/{disbursementTypeId}
```

The database table is:

```text
tblDisbursementTypeLookup
```

The management API uses:

- `USP_DisbursementType_Add`
- `USP_DisbursementType_Upd`
- `USP_DisbursementType_Validate`
- direct delete from `tblDisbursementTypeLookup`

When `includeAll = false`, the management API only returns active, non-system types:

```text
iActive = @isActive and iSystem = 0
```

Delete is blocked if the disbursement type is linked to a fee.

## System-Generated Disbursements

System disbursements can be created outside the Disbursements page through DB triggers and procedures tied to:

- fees
- liabilities
- loan amount
- loan purpose / cash out
- valuation
- security / legal fees
- LMI
- construction progress payments

Relevant files are under:

- `los-db-quantum/triggers`
- `los-db-quantum/sprocs`

## Notable Risks And Quirks

[Risk] `GetDisbursementFeesByAppIDQuery` builds a `formattedResponse` with `FeeOnProducts`, but returns `response.ToList()` instead. That means the grouping work is currently ignored.

[Risk] Add/update stored procedures silently return for zero disbursement amounts. The UI may treat a successful HTTP call differently depending on how the empty stored procedure result maps through the API.

[Risk] The UI patches `allDisbursements` locally after add/edit/delete instead of refetching the full disbursement set. Any stored-procedure-side derived fields not returned by add/update can drift until reload.

[Risk] Retained checkbox changes are saved row-by-row before recalculation. A partial failure could leave retained flags updated without the final totals being recalculated.

[Verified] No code changes were made during the investigation that produced this document.
