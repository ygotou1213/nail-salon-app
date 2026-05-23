# Stage 1 Rollout Notes

Date: 2026-05-23

## Current Production References

- Git rollback commit: `6a2d55689f52e319f4a48d483675f9afb060d4b2`
- GAS Script ID: `1_900gbZunEV3CthY8C2BTA3lqljq_7aaF3J-yCzHeRcGIF4UtPqqo0s5`
- GAS production deployment ID: `AKfycbzaqPEJHTtxNy-OoCvyfoMUPNBL6T_6rR2tC6y2lxUER4jkSEWMX1GS_t9aar0bGjDG`
- GAS production deployment version before rollout: `@13`
- GAS production deployment after server token helper prep: `@14`
- Existing production URL: `https://ygotou1213.github.io/nail-salon-app/`
- Vercel API project: `nail-salon-app-api`
- Vercel API production URL: `https://nail-salon-app-api.vercel.app`
- Latest verified API deployment: `dpl_CkSWd8qJPHKdU2FvmzCzHo3qqqB7`

## Local Data Backup

- Backup file: `backup_20260523_pre_stage1_getAll.json`
- Source: deployed GAS `getAll`
- Row counts:
  - staff: 5
  - attendance: 108
  - shift: 155
  - shiftRequest: 5
  - softConstraint: 4
  - payslips: 1

Do not commit backup JSON files. They may contain personal, attendance, or payroll data.

## Rollback Triggers

Rollback before continuing diagnosis if any of these occur:

- Staff cannot clock in or clock out.
- Clock records are not saved to GAS/Sheets.
- Admin login blocks existing admin operations.
- Attendance data appears missing, overwritten, or corrupted.

## Rollback Methods

- Frontend: revert GitHub Pages to commit `6a2d55689f52e319f4a48d483675f9afb060d4b2`.
- GAS: redeploy or restore deployment `AKfycbzaqPEJHTtxNy-OoCvyfoMUPNBL6T_6rR2tC6y2lxUER4jkSEWMX1GS_t9aar0bGjDG @13`.
- API: disable the Vercel API integration and keep the existing GitHub Pages app as the operational entry point.

## Pre-Production Checklist

- Confirm Vercel project for `api/`.
- Set Vercel environment variables:
  - `GAS_URL` — configured for Production and Development.
  - `GAS_SERVER_TOKEN` — configured for Production and Development.
  - `ADMIN_PASSWORD` — configured for Production and Development using the existing operational admin password.
  - `SESSION_SECRET` — configured for Production and Development.
  - `ALLOWED_ORIGINS` — configured for Production and Development.
  - `CROSS_SITE_COOKIES` — configured for Production and Development.
- Configure GitHub Pages frontend to call the deployed API via `window.NS_API_BASE`.
- Deploy API to staging/preview and verify admin auth. Production API has been deployed and verified.
- Deploy frontend and GAS during a time when staff are not clocking in/out.
- After rollout, verify:
  - Staff clock-in.
  - Staff clock-out.
  - Record persistence after reload.
  - Correct admin login.
  - Incorrect admin login rejected.
  - Admin bootstrap succeeds after login.
  - Admin bootstrap fails after logout.

## Verified API Checks

- `GET /api/public/health` returns 200.
- CORS allows `https://ygotou1213.github.io`.
- `OPTIONS /api/admin/login` returns 204 with CORS headers.
- Wrong admin password returns 401.
- Existing admin password returns 200 and an HttpOnly Secure session cookie.
- Logged-in `GET /api/admin/bootstrap` returns GAS `getAll` data through the API.
- `POST /api/admin/logout` clears the session cookie.
- Logged-out `GET /api/admin/bootstrap` returns 401.
- GAS `getAll` still returns data after deployment `@14`.

## Notes

- Because GitHub Pages and Vercel are different sites, the API uses `SameSite=None; Secure`
  for admin session cookies when `CROSS_SITE_COOKIES=true`.
- The Vercel project was initially created with framework preset `Other`, so deployment used
  a local prebuilt Vercel output after setting local project metadata to `nextjs`.
