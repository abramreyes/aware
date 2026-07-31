# Disbursement Flow Notes

This was traced directly from the codebase without using the `aware` skill.

## Entry Points

The application disbursement page is registered as:

- UI route: `/applications/:appId/disbursements`
- Route file: `los-ui-quantum/src/router/routes/routesApplications.ts`
- Main UI file: `los-ui-quantum/src/views/applications/ApplicationDisbursements.vue`

The API routes are registered in:

- `los-api-quantum/LW.Los.Api/Modules/Applications/ApplicationsModule.cs`

Relevant application disbursement endpoints:

- `GET /applications/disbursements/{payeeId}`
- `GET /applications/{appId}/disbursements/fees`
- `POST /applications/{appId}/disbursements`
- `POST /applications/{appId}/disbursements/recalculate`
- `PUT /applications/{appId}/disbursements/{payeeId}`
- `PUT /applications/disbursements/{payeeId}/retained`
- `DELETE /applications/{appId}/disbursements/{payeeId}`

## UI Behaviour

`ApplicationDisbursements.vue` loads all visible disbursement rows from:

```text
GET /applications/{appId}/disbursements/fees
```

The returned rows are split into three main groups:

- `systemDisbursements`: `system === 1` and not linked to a liability.
- `manualDisbursements`: `system === 0` and not linked to a liability.
- `liabilitiesDisbursements`: linked to a liability and `payoutOnSettlement` is `1` or `3`.

The page then derives the display rows:

- Funds Disbursed table uses system disbursements except `Loan Amount`, plus manual disbursements.
- Liabilities paid out are shown separately.
- Loan amount is treated specially through `loanAmountData`.

The summary boxes are calculated client-side:

- `Total Disbursements`
- `Retained Disbursements`
- `Solicitor Disbursements`
- `Balance of Funds`

`Balance of Funds` is calculated as:

```text
application total loan amount
- disbursement item total
- paid-out liability disbursement total
- property purchase funds
- optional loan amount, when included and not retained
```

The page also updates the disbursement side-nav alert count for page id `1-17-0-0-0` when `Balance of Funds` is negative.

## Manual Add, Edit, Delete

Manual add/edit happens through the drawer form in `ApplicationDisbursements.vue`.

Before submit, the UI sets:

- `applicationID = activeAppId`
- `liabilityId = -1`
- `appLoanPurposeId = -1`
- `manualUpdated = 1`

If the selected row has a `payeeId`, the UI updates it:

```text
PUT /applications/{appId}/disbursements/{payeeId}
```

Otherwise it creates a new manual disbursement:

```text
POST /applications/{appId}/disbursements
```

Delete uses:

```text
DELETE /applications/{appId}/disbursements/{payeeId}
```

## Save Funds Disbursed

Clicking Save on the page does two things:

1. Loops through all loaded disbursements and saves each `retained` flag:

```text
PUT /applications/disbursements/{payeeId}/retained
```

2. Recalculates and persists totals/config:

```text
POST /applications/{appId}/disbursements/recalculate
```

The recalculate payload includes:

- `accountType`
- `propertyPurchaseFunds`
- `includeBaseLoanAmt`
- `retainedPropertyPurchaseFunds`
- `retainedBaseLoanAmt`
- `update = true`

## API Command Flow

Read path:

- Endpoint: `GetDisbursementFeesByAppIDEndpoint`
- Query: `GetDisbursementFeesByAppIDQuery`
- SQL: `EXEC sp_DisbursementFee_Get @iAppID,@cType`

Create path:

- Endpoint: `InsertFundsDisbursementTOEndpoint`
- Command: `InsertFundsDisbursementTOCommand`
- SQL procedure: `USP_DM_Payee_Add`

Update path:

- Endpoint: `UpdateAppDisbursementsEndpoint`
- Command: `UpdateAppDisbursementsCommand`
- SQL procedure: `USP_DM_Payee_Update`

Delete path:

- Endpoint: `DeleteAppDisbursementsByPayeeIDEndpoint`
- Command: `DeleteAppDisbursementsCommand`
- SQL procedure: `USP_DM_Payee_Delete`

Retained-only update path:

- Endpoint: `UpdateAppDisbursementsRetainedByPayeeIDEndpoint`
- Command: `UpdateAppDisbursementsRetainedCommand`
- SQL procedure: `USP_DM_Payee_Update_Retained`

Recalculate path:

- Endpoint: `InsertAppDisbursementMainEndpoint`
- Command: `InsertAppDisbursementMainCommand`
- SQL procedure: `USP_DM_Recalculate_Total`

## Database Tables

Main tables:

- `tblAppDisbursements`: individual disbursement/payee rows.
- `tblAppDisbursementMain`: page-level totals and configuration.
- `tblDisbursementTypeLookup`: disbursement type metadata, including system/manual and retained defaults.

`tblAppDisbursements` carries the linking fields that explain where a row came from:

- `iLiabilityID`
- `iAppCostID`
- `iAppLoanPurposeID`
- `iValuationID`
- `iSecurityID`
- `iLinkedAppProductID`

## Read Procedure

`los-db-quantum/sprocs/sp_DisbursementFee_Get.sql`:

1. Creates `#tblDisbursement`.
2. Loads rows from `tblAppDisbursements`.
3. Joins to disbursement type lookup, liabilities, loan purposes, securities, fees, and app costs.
4. Builds a display label in `cDisbursementType`.
5. Removes rows with null/zero `fDisbursementAmount`.
6. Removes reverted/orphaned construction payment disbursements.
7. Supports type filtering:
   - `L`: liabilities
   - `S`: system generated
   - `M`: manually added
   - otherwise all
8. For the all case, de-duplicates by `iPayeeID` using `ROW_NUMBER()`.

## Write Procedures

`USP_DM_Payee_Add`:

- Inserts into `tblAppDisbursements`.
- Ignores zero-value disbursement amounts.
- Uses `sp_GetNextID 'tblAppDisbursements'` to generate `iPayeeID`.
- For manual updates, retained defaults come from `tblDisbursementTypeLookup`.
- For system-created rows, it can auto-populate linked product, BSB, and account number.
- Calls `USP_DM_Recalculate_Total` after insert.

`USP_DM_Payee_Update`:

- Updates an existing `tblAppDisbursements` row by `iPayeeID`.
- If the amount is zero, it deletes the row instead.
- Retained value is reset from `tblDisbursementTypeLookup`.
- Calls `USP_DM_Recalculate_Total` after update.

`USP_DM_Payee_Delete`:

- Deletes from `tblAppDisbursements` by `iPayeeID`.
- Calls `USP_DM_Recalculate_Total` after delete.

`USP_DM_Payee_Update_Retained`:

- Updates only `iRetained` and `UpdatedBy` for a row.
- Does not recalculate totals by itself; the UI follows this with `USP_DM_Recalculate_Total`.

`USP_DM_Recalculate_Total`:

- Calculates source total from `tblAppProduct`.
- Finds the `Loan Amount` disbursement type.
- Calculates total disbursements excluding `Loan Amount`.
- Calculates retained and disbursed totals.
- Adds property purchase funds into either retained or disbursed total depending on `bRetainedPropertyPurchaseFunds`.
- Optionally includes base loan amount, using the retained flag from the `Loan Amount` row.
- If account type is `1` (`External Account` in the UI), retained amounts are included in disbursed total.
- Calculates balance of funds as:

```text
source total - total disbursement amount
```

- Persists via `USP_DM_Save_Disbursements`.

`USP_DM_Save_Disbursements`:

- Inserts or updates `tblAppDisbursementMain`.
- Updates the retained flag on the `Loan Amount` disbursement row.

## Automatic/System Disbursement Creation

Several triggers create or maintain system disbursement rows:

- `tg_InsManageDisbursementLoanAmount.sql`
  - Source table: `tblAppProduct`
  - Disbursement type: `Loan Amount`
  - Amount is summed product initial amount, excluding credit cards.

- `tg_InsManageDisbursementFee.sql`
  - Source table: `tblAppCost`
  - Uses `tblFees.iDisbursementType`.
  - Skips fees with no linked disbursement type.
  - Deletes the disbursement if the fee is marked collected.

- `tg_InsManageDisbursementLiability.sql`
  - Source table: `tblAppLiability`
  - Disbursement type: `Paid Out Liability`
  - Only applies when payout-on-settlement is set and not equal to `2`.

- `tg_InsManageDisbursementLoanPurpose.sql`
  - Source table: `tblAppLoanPurpose`
  - Disbursement type: `Cash Out`
  - Only applies when the funder loan purpose is marked cash-out.

There are matching update triggers for loan amount, fee, liability, and loan purpose changes.

## Disbursement Type Management

Settings UI:

- `los-ui-quantum/src/views/settings/system/finance/DisbursementsSettings.vue`

Management API:

- `GET /disbursements/types`
- `POST /disbursements/types`
- `PUT /disbursements/types/{id}`
- `DELETE /disbursements/types/{id}`

The management query reads from `tblDisbursementTypeLookup`.

When `includeAll = false`, only active, non-system types are returned. This is what the add/edit drawer uses for normal manual selection. Existing system rows can still expose all types when required so the selected system type can be displayed.

## Notable Risk Found

`GetDisbursementFeesByAppIDQuery` builds a `formattedResponse` that groups `FeeOnProducts`, but returns `response.ToList()` instead of `formattedResponse`.

That looks suspicious if the UI depends on grouped fee/product context. The grouping code may currently be dead or incomplete.

