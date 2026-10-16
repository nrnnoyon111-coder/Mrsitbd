# MRS Fast Solution — Industrial Electronics Repair & Sales System

Production-ready web application and business management suite for **MRS Fast Solution** (Mirpur-13, Dhaka, Bangladesh), combining a public corporate website with real-time public Job Tracker/History and a full-featured Admin Panel inspired by the client's RepairDesk workflow and Bseba ERP visual reference.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Key Architectural Decisions & User Profile Configuration:**
> 1. **Initial Users Configured from Provided Contacts**:
>    - **MD Rakibul Islam** (`rakibulislamsarker24@gmail`, `01869217526`) — Super Administrator & Lead Industrial Engineer (Full access to all modules, financial KPIs, and settings).
>    - **MRS Office** (`mrsfastsolutions@gmail.com`, `01334362397`) — Official Office & Public Operations Profile (Customer contact, billing, inquiry coordination).
>    - **MD. Ahadul Islam** (`ahadulislam0494@gmail.com`, `01831336536`) — Senior Electronics Technician & Operations Admin (Repair management, job status updates, board diagnosis).
> 2. **Official Logo Asset**: Using the user's high-resolution modern blue tech circuit logo (`file_000000004c3081f4827909e7207bb7a9.png` / `MrsLogo.tsx`) across both the public header, hero, printable thermal receipts, and admin navigation bar.
> 3. **Strict Sequential Job Numbering**: Atomic server-side sequence starting at `M0001` → `M0002` → `M0003`... preventing duplicates or gaps even under concurrent admin entries.
> 4. **Speed & Offline-First Google Sheet Sync**: Fast local JSON cache on the server provides `<50ms` response times. Operational entries update local storage and the UI immediately, while Google Sheet sync queues in the background with automatic retry, CSV export, and conflict protection.

---

## 1. Overview & Core Concept

- **What It Does**: A dual-purpose portal serving Bangladesh's industrial garment and automation sector:
  - **Public Customer Portal**: Corporate homepage detailing circuit board diagnostic capabilities (fusing machines, lockstitch sewing, servo drives, VFD inverters), quick WhatsApp/Call direct links, and a real-time **Public Job Tracker** & **Phone-based Job History** where garment factory managers track board repair progress and warranty validity.
  - **Admin & Workshop Management (RepairDesk + Bseba Style)**: Comprehensive workbench for logging incoming circuit boards, selecting presets (Hashima, Juki, Jack, Brother; Main Board, Servo Board, CTL Board), tracking diagnostics, managing client credit ledgers, processing spare parts inventory & counter sales, tracking shop expenses, printing customer delivery receipts, and synchronizing data with Google Sheets.
- **Target Audience**: Factory owners, maintenance engineers, and mechanics from garment hubs (Ashulia, Gazipur, Savar, Narayanganj), alongside MRS technicians and workshop administrators.
- **Key Value**: Zero turnaround delays, instant tracking without calling the shop, transparent service billing & warranty tracking, and error-free workshop bookkeeping.

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Visual Identity
Following the uploaded reference video (Bseba IT Shop) and laptop screens (RepairDesk / `jukibd.com`):
- **Canvas & Tone**: Crisp, clinical white canvas (`#FFFFFF`) with ultra-clean subtle cool slate structure (`#F8FAFC`, `#F1F5F9`) and thin 1px borders (`#E2E8F0`).
- **Brand Palette**:
  - **Dominant Primary**: Deep Precision Royal Blue (`#1D4ED8` / `#2563EB`) reflecting technical industrial authority.
  - **Status Semantics**:
    - *Received*: Blue `#2563EB`
    - *Diagnosing*: Amber `#D97706`
    - *In Processing*: Indigo `#7C3AED`
    - *Completed*: Emerald `#059669`
    - *Picked Up*: Slate `#475569`
    - *Declined*: Rose/Crimson `#DC2626`
- **Typography & Tabular Discipline**:
  - Headings & Brand: `Plus Jakarta Sans`, tight tracking, balanced layout.
  - Data, Job IDs (`M0001`), Challan numbers, and Financial amounts (BDT ৳): Strict `tabular-nums font-mono` to prevent jitter and ensure vertical alignment.
- **Top Bar Contract**:
  - Public: Brand Wordmark with Logo on the left; clean text links (*Home*, *About*, *Services*, *Track Job*, *History*, *Contact*) in the center; Single primary action button (*Admin Login*) on the right.
  - Admin: Context breadcrumb trail and quick search on the left; user profile avatar with active role badge and Quick "+ Add Job" button on the right.
- **Anti-Slop Restraint**: Zero decorative pulsing dots, zero fake AI badges, zero pill sandwich cards, zero code comment slashes. Clean unboxed metadata with natural typographic separators (`·`).

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Solution | Rationale & Trade-offs |
|---|---|---|
| **Data Architecture** | Fast server database (`data/mrs_database.json`) + Background Sync Queue | Ensures instantaneous response times (<50ms) for public search and admin operations without waiting on slow Google Sheet API calls. |
| **Sequential Job IDs** | Server-authoritative atomic generator (`M0001`, `M0002`...) | Guarantees zero duplicate job IDs or numbering gaps across concurrent browser sessions. |
| **Public Tracking Privacy** | Job/Challan direct lookup + Phone lookup with phone number masking (`017****344`) | Allows clients to check their board status instantly while protecting contact phone numbers and internal shop technician notes. |
| **Preset Machine Data** | Centralized Master Data (Brands, Models, Board Types, Technicians) | Add Job modal provides instant searchable select dropdowns matching `job.jukibd.com` screen flow while allowing admins to create new options inline. |
| **Thermal / Print Receipts** | Clean `@media print` layout without navigation chrome | Produces official 80mm POS slip or A4 Delivery Challan with customer copy, repair details, warranty validity date, and authorized signature line. |

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT VIEWPORT (BROWSER)                       │
├───────────────────────────────────┬────────────────────────────────────┤
│           Public Portal           │            Admin Portal            │
│  • Hero & Circuit Services        │  • Workshop Dashboard (KPIs)       │
│  • Public Job Tracker (Search)    │  • Add Job Modal (M000X Auto)      │
│  • Public Job History (By Phone)  │  • Job List (Filter, Print, CSV)   │
│  • Contact & Direct WhatsApp/Call │  • Client Ledger & Machine Data    │
│  • Receipt & Challan Printout     │  • Sales, Inventory, Accounts      │
│                                   │  • Users & Granular Roles (3 Admins)│
│                                   │  • Google Sheet Sync Monitor       │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EXPRESS BACKEND SERVER (Node.js)                   │
├────────────────────────────────────────────────────────────────────────┤
│  • /api/jobs (CRUD, Atomic M000X generation, Status, Payment, Archive) │
│  • /api/jobs/track & /api/jobs/history (Indexed Fast Lookup)           │
│  • /api/clients (Client Directory, Contact info, Job totals)           │
│  • /api/presets (Brands: Hashima/Juki/Jack; Boards: Main/Servo/CTL...) │
│  • /api/sales & /api/products (Counter Sales, Inventory Stock alert)   │
│  • /api/expenses & /api/dashboard/kpis (Financial Health Summary)      │
│  • /api/users & /api/auth (3 Admin accounts, Granular Permissions)     │
│  • /api/cms & /api/settings (Customizable homepage info, Currency, Sync)│
│  • /api/sync/status & /api/sync/now (Google Sheet Bridge & CSV Export) │
└──────────────────┬───────────────────────────────────┬─────────────────┘
                   │                                   │
                   ▼                                   ▼
┌──────────────────────────────────────┐   ┌─────────────────────────────┐
│      FAST LOCAL DATABASE CACHE       │   │     GOOGLE SHEETS SYNC      │
│     (data/mrs_database.json)         │   │   MRS Business Database     │
│  • Atomic synchronous writes         │   │  • Background sync worker   │
│  • 500-item indexed audit logs       │   │  • CSV export for all tabs  │
│  • Resilient offline preservation    │   │  • Non-blocking retry queue │
└──────────────────────────────────────┘   └─────────────────────────────┘
```

### Core Entities & Relationships

1. **RepairJob**: `jobNumber` (e.g. `M0001`), `receivedDate`, `deliveryDate`, `customerName`, `company`, `phone`, `whatsapp`, `brand`, `model`, `boardType`, `boardNumber`, `boardSerial`, `problem`, `remarks`, `challan`, `technician`, `status`, `serviceCharge`, `receivedAmount`, `due`, `warrantyDays`, `warrantyUntil`, `isArchived`.
2. **Client**: `clientCode` (`CLI-001`), `company`, `customerName`, `phone`, `whatsapp`, `email`, `address`, `totalJobs`, `totalSpent`, `status`.
3. **Product & Stock**: `productId` (`EL-001`), `name`, `category`, `unit`, `purchasePrice`, `salePrice`, `currentStock`, `minStockLevel`, `status`.
4. **Sale & Expense**: Counter sales invoices with itemized components, cash/bKash payment methods, and operational workshop expenses.
5. **User**: Name, Email/Gmail, Phone, Avatar, Role Title, Assigned Functional Roles, Granular Boolean Permissions, Password Hash.
6. **Presets**: Brands (`Hashima`, `Juki`, `Jack`, `Brother`, `Pegasus`, `Kansai Special`), Board Types (`Main Board`, `Servo Board`, `CTL Board`, `Power Supply`, `Inverter Drive`), Models (`HP-450 MS`, `DDL-9000B`, `A4-E`, etc.).

---

## 5. Implementation Sequence

1. **User Accounts & Initial Setup**:
   - Update database seeds with the three specific profiles: **MD Rakibul Islam** (Super Admin), **MRS Office** (Office / Public Contact), and **MD Ahadul Islam** (Technician / Admin).
   - Ensure secure login authentication and role-based navigation.
2. **Repair Management (RepairDesk Workflow)**:
   - Verify atomic `M0001` generation and live Add Job modal with instant client auto-fill.
   - Refine Job List with status change actions, quick payment recording, thermal receipt generation, and single-click copy buttons.
3. **Preset Machine & Board Data**:
   - Provide direct management for Brands, Models, and Board Types matching the user's garment industry focus (Hashima, Juki, Jack, Brother, Kansai Special).
4. **Public Portal & Job Tracker**:
   - Polish corporate homepage with high-res circuit logo, technical capability cards, and direct WhatsApp/Phone call links.
   - Test Job Tracker and Job History lookups with safe phone masking.
5. **Sales, Inventory & Financial Accounting (Bseba Reference)**:
   - Combine Repair Income + Sales Income vs Expenses into the high-level KPI dashboard.
6. **Google Sheet Sync & Data Integrity**:
   - Implement background sync status monitor, manual Sync Now trigger, and CSV export for Google Sheet tabs.
7. **Compilation & End-to-End Verification**:
   - Verify build clean with `compile_applet`, test all user roles, and confirm responsive layouts on desktop and mobile.
