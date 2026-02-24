# Main Components Documentation

> **Directory:** `src/app/main/components/` · **Files:** 74 + 2 subdirectories
> **Purpose:** Reusable UI components shared across the application — tables, inputs, menus, tooltips, pagination, and utilities.

---

## Component Catalog

### Tables & Data Display

| Component                   | Size  | Description                                                                        |
| --------------------------- | ----- | ---------------------------------------------------------------------------------- |
| `SimpleSortableTable.js`    | 13KB  | Generic sortable table with column definitions, selection, search, and row actions |
| `SimpleSortableTableRow.js` | 5.9KB | Individual row for SimpleSortableTable                                             |
| `TableContainer.js`         | 7.8KB | Container/wrapper for table components with pagination                             |
| `DashboardCard.js`          | 1.8KB | Card wrapper for dashboard analytics widgets                                       |
| `MiniWidget.js`             | 1.6KB | Small stat widget (number + label)                                                 |

### Forms & Inputs

| Component                  | Size  | Description                            |
| -------------------------- | ----- | -------------------------------------- |
| `PhoneNumberInput.js`      | 2.5KB | Phone input with country code selector |
| `SearchComponent.js`       | 1.5KB | Search text field with clear button    |
| `ButtonsSelector.js`       | 1.6KB | Button group multi-selector            |
| `CheckboxesSelector.js`    | 2.2KB | Checkbox group selector                |
| `SessionDurationSelect.js` | 1.4KB | Duration dropdown for session config   |
| `SelectTime.js`            | 1.2KB | Time selector component                |
| `LanguageDropdown.js`      | 1.2KB | Language selection dropdown            |
| `IconQuizCheckbox.js`      | 1KB   | Icon quiz enable/disable checkbox      |
| `RoomSelectionDropdown.js` | 918B  | Room/location dropdown                 |

### Buttons & Actions

| Component                            | Size  | Description                        |
| ------------------------------------ | ----- | ---------------------------------- |
| `ButtonWithLoader.js`                | 2.2KB | Button with loading spinner state  |
| `RunSessionButton.js`                | 1.6KB | Start/resume session action button |
| `FullScreenButton.js`                | 911B  | Fullscreen toggle button           |
| `SocialButton.js`                    | 1.3KB | Social media link button           |
| `DownloadCoursePrintableQrButton.js` | 1.5KB | Download printable QR code         |

### Menus

| Component                | Size  | Description                    |
| ------------------------ | ----- | ------------------------------ |
| `ActionMenuContainer.js` | 2KB   | Generic action menu container  |
| `ActionsMenu.js`         | 901B  | Action menu dropdown           |
| `DropDownMenu.js`        | 3.2KB | Custom dropdown menu component |
| `CourseMenu.js`          | —     | Course-specific context menu   |

### Check-In & Attendance

| Component                    | Size  | Description                                       |
| ---------------------------- | ----- | ------------------------------------------------- |
| `CheckinMethod.js`           | 2.3KB | Check-in method icon renderer (QR/IVR/GPS/manual) |
| `CheckinMethodTooltip.js`    | 947B  | Tooltip showing check-in method details           |
| `CheckinImageDialog.js`      | 782B  | Dialog showing check-in photo                     |
| `StudentCheckin.js`          | 1.6KB | Student check-in status indicator                 |
| `StudentDetails.js`          | 8.2KB | Student detail panel (name, attendance history)   |
| `LocationIcon.js`            | 881B  | GPS location status icon                          |
| `LocationStatus.js`          | 1.1KB | Location verification status                      |
| `FieldCheckinTooltip.js`     | 3.9KB | Field check-in details tooltip                    |
| `FieldCheckinTooltipMenu.js` | 3.5KB | Field check-in tooltip with menu actions          |

### Date & Time

| Component           | Size  | Description                      |
| ------------------- | ----- | -------------------------------- |
| `DateRange.js`      | 2.1KB | Date range picker                |
| `DateRangeAdmin.js` | 2KB   | Admin-specific date range picker |
| `WeekSelector.js`   | 3.6KB | Week navigation selector         |
| `FormattedDate.js`  | 259B  | Formatted date display           |
| `CounterDown.js`    | 1.3KB | Countdown timer display          |

### Navigation & Pagination

| Component              | Size  | Description             |
| ---------------------- | ----- | ----------------------- |
| `SessionPagination.js` | 3.4KB | Session list pagination |
| `StudentPagination.js` | 3KB   | Student list pagination |

### QR & Templates

| Component                       | Size   | Description                               |
| ------------------------------- | ------ | ----------------------------------------- |
| `CourseQrCodeDownloadDialog.js` | 3.8KB  | QR code download dialog for field courses |
| `QrPdf.js`                      | 4KB    | Generate printable QR PDF                 |
| `Templates.js`                  | 11.2KB | Session/course template management        |

### Geo & Post-Check-In

| Component             | Size  | Description                         |
| --------------------- | ----- | ----------------------------------- |
| `GeolocationSetup.js` | 1.9KB | Geolocation configuration component |
| `PostCheckinData.js`  | 2.3KB | Post-check-in URL data display      |

### Marketing & Home Page

| Component        | Size  | Description               |
| ---------------- | ----- | ------------------------- |
| `BookDemo.js`    | 2.9KB | Book a demo CTA component |
| `LogosSlider.js` | 1.8KB | Client logo carousel      |

### Other

| Component           | Size  | Description                                |
| ------------------- | ----- | ------------------------------------------ |
| `CustomElements.js` | 384B  | `StyledTooltip` and custom styled elements |
| `ErrorToast.js`     | 1.6KB | Error notification toast                   |
| `FirstTime.js`      | 1.7KB | First-time user experience wrapper         |
| `FullPageLoader.js` | 929B  | Full page loading spinner                  |
| `x-v-icon.js`       | 1.4KB | Custom check/X icon component              |

### Subdirectories

| Directory         | Files | Description                       |
| ----------------- | ----- | --------------------------------- |
| `courseSessions/` | 1     | Course sessions utility component |
| `notifications/`  | 3     | Notification components           |

---

## Rebuild Notes

> [!IMPORTANT]
> **Must preserve:**
>
> - `SimpleSortableTable` column-definition API — used by Courses, Sessions, Students, and Admin tables
> - `CheckinMethod` icon mapping (QR, IVR, GPS, manual, field) — shared across course, session, and mobile views
> - `ButtonWithLoader` loading-state pattern — used throughout dialogs and forms
> - `DateRange` / `WeekSelector` date filtering behavior — critical for admin analytics
> - `QrPdf` printable PDF layout — hosts share these with students
> - `Templates.js` session/course template CRUD — maps to dedicated API endpoints
> - `PhoneNumberInput` country code integration — shared with mobile attendee signup

> [!WARNING]
> **Issues to address:**
>
> 1. `SimpleSortableTable` (13KB) + `SimpleSortableTableRow` (5.9KB) — replace with shadcn `DataTable` (TanStack Table); significantly reduces code
> 2. `Templates.js` (11.2KB) — decompose into smaller components
> 3. `TableContainer.js` (7.8KB) — likely redundant with shadcn DataTable pagination
> 4. `StudentDetails.js` (8.2KB) — large component, candidate for decomposition
> 5. `CustomElements.js` / `x-v-icon.js` — replace with Lucide icons + Tailwind
> 6. `ErrorToast.js` — replace with shadcn `Sonner` (toast) component
> 7. Dead component audit needed — verify all 74 components are actually imported/used

> [!TIP]
> **shadcn mapping strategy:**
>
> | Current Component                         | shadcn Replacement           | Notes                             |
> | ----------------------------------------- | ---------------------------- | --------------------------------- |
> | `SimpleSortableTable`                     | `DataTable` (TanStack Table) | Built-in sort, filter, pagination |
> | `ButtonWithLoader`                        | `Button` + `loading` prop    | Tailwind `animate-spin`           |
> | `SearchComponent`                         | `Input` + debounce           | Direct port                       |
> | `DateRange` / `DateRangeAdmin`            | `Calendar` + `Popover`       | date-fns integration              |
> | `SessionDurationSelect` / `SelectTime`    | `Select`                     | Radix primitive                   |
> | `DropDownMenu` / `ActionMenuContainer`    | `DropdownMenu`               | Radix primitive                   |
> | `DashboardCard` / `MiniWidget`            | `Card`                       | Tailwind styling                  |
> | `ErrorToast`                              | `Sonner` (toast)             | Position + auto-dismiss           |
> | `FullPageLoader`                          | Custom `Spinner`             | Tailwind animation                |
> | `SessionPagination` / `StudentPagination` | Built into `DataTable`       | Eliminate separate components     |
