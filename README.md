# CuraSense AI — Intelligent Healthcare Operating System

<div align="center">

![CuraSense AI](https://img.shields.io/badge/CuraSense-AI%20Healthcare-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMjJjMi0yIDctMiA3LTVWOGMwLTMtNS0zLTctNVM1IDUgNSA4djljMCAzIDUgMyA3IDV6Ii8+PHBhdGggZD0iTTkgMTJoLjAxIi8+PHBhdGggZD0iTTE1IDEyaC4wMSIvPjxwYXRoIGQ9Ik0xMiAxNmMtMSAwLTIgLjUtMiAxcy41IDEgMiAxIDItLjUgMi0xLS41LTEtMi0xeiIvPjwvc3ZnPg==&labelColor=4f46e5)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-black?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini-4285F4?logo=googlegemini&logoColor=white)](https://ai.google.dev)

</div>

---

<div align="center">

### *"Smarter care for every role in the hospital."*

</div>

---

## What is CuraSense?

**CuraSense AI** is a full-stack, AI-powered hospital operating system that unifies **doctors**, **patients**, **nurses**, and **laboratories** into one polished, responsive web portal. Built with React + TypeScript + Supabase + shadcn/ui, it delivers secure OTP-based onboarding, real-time vitals dashboards, AI-assisted consultations, voice transcription, lab report analysis, and live human verification — all in a single cohesive experience.

> **Disclaimer:** CuraSense is a **demo/educational platform**. It is not a medical device and does not provide definitive diagnoses. Always consult a licensed healthcare professional.

---

## Core Capabilities

<table>
<tr>
<td width="50%">

### **For Doctors**
- AI-assisted consultation screening with symptom probability ranking
- Voice transcription (Hindi / English / Hinglish) → structured symptom extraction
- Smart medicine suggestions linked to detected symptoms
- Risk scoring & recovery rate estimation
- Patient messaging with auto-reply simulation
- Previous consultation history & billing

</td>
<td width="50%">

### **For Patients**
- **Live vitals dashboard** — heart rate, BP, SpO₂, temperature, step count
- **CuraSense AI Chat** — empathetic health companion
- Book appointments (in-person or video) with doctor search
- Prescription tracker with refill requests
- Lab test booking & downloadable reports
- Bills & payments management
- Mandatory camera-based **human verification** before login

</td>
</tr>
<tr>
<td width="50%">

### **For Nurses**
- Emergency alert dashboard with critical patient flags
- Medicine schedule tracker with dose timing
- Room assignment & occupancy management
- Pending patient queue with priority sorting
- Vitals entry form for bedside monitoring

</td>
<td width="50%">

### **For Laboratories**
- Assigned test orders with pending/completed tabs
- Report upload workflow
- Patient & test search
- One-click "Mark Completed" status updates
- Recent reports tracking

</td>
</tr>
</table>

---


## Security & Verification

- **OTP-first login** — Phone number + role selection + 4-digit OTP (demo mode shows code in toast)
- **Live Human Verification** — Camera-based face detection using [face-api.js](https://github.com/justadudewhohacks/face-api.js) with SSD MobileNet + Tiny Face Detector + 68-point landmark detection
- **Liveness check** — Motion-based brightness variance analysis prevents photo spoofing
- **Role-based routing** — Doctor → Dashboard, Patient → PatientDetails, Nurse → Nurse Station, Lab → Lab System
- **HIPAA-ready** architecture with encrypted localStorage and Supabase Row-Level Security

---

## Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18.3 + TypeScript 5.8 |
| **Build Tool** | Vite 8.0 (SWC plugin) |
| **Styling** | Tailwind CSS 3.4 + `tailwindcss-animate` |
| **UI Components** | shadcn/ui (Radix Primitives) — 48 components |
| **Routing** | React Router v6 (lazy-loaded pages) |
| **State & Data** | TanStack React Query 5, React Hook Form 7 + Zod |
| **Charts** | Recharts 2.15 |
| **Markdown** | `react-markdown` + `remark-gfm` |
| **Icons** | Lucide React (460+ icons) |
| **Backend (BaaS)** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **AI Gateway** | Lovable AI Gateway → Gemini 2.5 Flash |
| **AI Providers** | Google Gemini, Groq, OpenAI |
| **Face Detection** | face-api.js (SSD MobileNet + Tiny Face Detector) |
| **Testing** | Vitest 3.2 + Testing Library |
| **Linting** | ESLint 9 + typescript-eslint |
| **Deployment** | Vercel (configured via `vercel.json`) |

</div>

---

## Project Structure

```
CuraSense-AI/
├── public/
│   ├── favicon.svg              # Medical cross icon
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── medical-hero.jpg     # Hero banner image
│   ├── components/
│   │   ├── medical/             # Shared medical components
│   │   │   ├── AIChat.tsx       # Core AI chat widget
│   │   │   ├── AIChat-FIXED.tsx
│   │   │   ├── AIChatStandalone.tsx
│   │   │   ├── AppHeader.tsx    # Unified app header
│   │   │   ├── Logo.tsx         # CuraSense logo component
│   │   │   └── SmartLogo.tsx
│   │   ├── nurse/               # Nurse-specific components
│   │   │   ├── EmergencyAlert.tsx
│   │   │   ├── MedicineSchedule.tsx
│   │   │   ├── NurseHeader.tsx
│   │   │   ├── PendingPatients.tsx
│   │   │   ├── RoomAssignment.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── VitalsEntry.tsx
│   │   ├── lab/                 # Lab-specific components
│   │   │   ├── AssignedTests.tsx
│   │   │   ├── LabHeader.tsx
│   │   │   ├── RecentReports.tsx
│   │   │   └── ReportUpload.tsx
│   │   └── ui/                  # 48 shadcn/ui components
│   ├── hooks/                   # Custom React hooks
│   ├── integrations/
│   │   └── supabase/            # Supabase client + generated types
│   ├── lib/                     # Utilities
│   │   ├── faceUtils.ts         # Face detection & liveness check
│   │   └── utils.ts             # cn() classname merger
│   ├── pages/                   # 12 lazy-loaded routes
│   │   ├── Index.tsx            # Landing page
│   │   ├── Login.tsx            # OTP login with role selection
│   │   ├── Details.tsx          # Doctor details + face verification
│   │   ├── Dashboard.tsx        # Doctor dashboard
│   │   ├── NewData.tsx          # New consultation
│   │   ├── PreviousData.tsx     # Consultation history
│   │   ├── PatientDetails.tsx   # Patient details + face verification
│   │   ├── PatientDashboard.tsx # Full patient portal
│   │   ├── Nurse.tsx            # Nurse station
│   │   ├── Lab.tsx              # Laboratory system
│   │   ├── DoctorMessages.tsx   # Doctor-patient messaging
│   │   ├── ComingSoon.tsx       # Placeholder
│   │   └── NotFound.tsx         # 404
│   ├── test/                    # Vitest setup + example test
│   ├── App.tsx                  # Root app with lazy routes + providers
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + CSS variables
├── supabase/
│   ├── functions/               # 6 Edge Functions (Deno)
│   │   ├── patient-ai-assistant/
│   │   ├── diagnose-symptoms/
│   │   ├── analyze-consultation/
│   │   ├── analyze-lab-report/
│   │   ├── transcribe-voice/
│   │   └── patient-ai-demo/
│   ├── migrations/              # 4 SQL migration files
│   └── config.toml              # Supabase local config
├── index.html                   # Entry HTML with face-api.js CDN
├── package.json                 # Dependencies
├── vite.config.ts               # Vite config with path aliases
├── tailwind.config.ts           # Tailwind + custom theme tokens
├── tsconfig.json                # TypeScript config
├── vercel.json                  # Vercel deployment config
├── components.json              # shadcn/ui config
└── README.md                    # Project documentation
```

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **npm** or **bun** (bun lockfile included)
- A **Supabase** project (free tier works)
- Optional: **Gemini API Key** ([get one free](https://aistudio.google.com/app/apikey)) for live AI chat

### 1. Clone & Install

```bash
git clone https://github.com/Abhix6677/CuraSense-AI.git
cd CuraSense-AI
npm install
```

### 2. Environment Setup

Create a `.env` file (already templated):

```env
VITE_SUPABASE_PROJECT_ID="your_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

### 3. Supabase Edge Functions

Deploy the edge functions to your Supabase project:

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your_project_id

# Deploy all functions
supabase functions deploy patient-ai-assistant
supabase functions deploy diagnose-symptoms
supabase functions deploy analyze-consultation
supabase functions deploy analyze-lab-report
supabase functions deploy transcribe-voice
supabase functions deploy patient-ai-demo
```

Set secrets in Supabase Dashboard → Edge Functions:
- `LOVABLE_API_KEY` — for AI gateway access
- `GEMINI_API_KEY` — for Gemini direct calls
- `GROQ_API_KEY` — for Groq fallback
- `OPENAI_API_KEY` — for OpenAI fallback

### 4. Run Locally

```bash
npm run dev
# → http://localhost:8080
```

### 5. Build for Production

```bash
npm run build
npm run preview
```

---

## Demo Flow

1. **Landing Page** → See role cards & highlights
2. **Login** → Enter phone + select role (Doctor / Patient / Nurse / Lab) → OTP sent
3. **Face Verification** → Camera activates → face-api.js detects human presence → verified
4. **Role Dashboard** → Role-specific UI with live data, AI tools, and workflows

| Role | Post-Login Route | Key Feature |
|---|---|---|
| Doctor | `/dashboard` | AI consultation screening + patient history |
| Patient | `/patient-dashboard` | Live vitals + AI health chat + appointments |
| Nurse | `/nurse` | Emergency alerts + medicine schedule |
| Lab | `/lab` | Test order management + status tracking |

---

## Design System

CuraSense uses a custom medical-grade design system built on Tailwind CSS + shadcn/ui:

- **`gradient-text`** — Primary gradient text accents
- **`bg-gradient-primary`** — Signature purple-blue gradient buttons
- **`bg-gradient-soft`** — Subtle page backgrounds
- **`card-medical`** — Frosted glass cards with `backdrop-blur`
- **`shadow-glow`** — Primary-colored glow shadows
- **`shadow-large`** — Deep elevation shadows
- **`hero-bg`** — Landing page background
- **`glass`** — Frosted glass panels
- **`animate-slide-up`** — Staggered entrance animations
- **`animate-pulse-soft`** — Gentle breathing pulse
- **`font-display`** — Custom display font stack

---

## Page Routes

| Route | Page | Lazy Loaded |
|---|---|---|
| `/` | Landing Page | Yes |
| `/login` | OTP Login | Yes |
| `/details` | Doctor Details + Face Verify | Yes |
| `/dashboard` | Doctor Dashboard | Yes |
| `/new-data` | New Consultation | Yes |
| `/previous-data` | Consultation History | Yes |
| `/patient-details` | Patient Details + Face Verify | Yes |
| `/patient-dashboard` | Patient Portal | Yes |
| `/nurse` | Nurse Station | Yes |
| `/lab` | Laboratory System | Yes |
| `/doctor-messages` | Doctor-Patient Chat | Yes |
| `*` | 404 Not Found | Yes |

---

## Testing

```bash
# Run tests once
npm run test

# Watch mode
npm run test:watch
```

Test framework: **Vitest 3.2** + **@testing-library/react** + **jsdom**

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Backend-as-a-Service client |
| `@tanstack/react-query` | Server state & caching |
| `react-router-dom` | Client-side routing (lazy) |
| `react-hook-form` + `zod` | Form validation |
| `recharts` | Vital signs & health charts |
| `react-markdown` + `remark-gfm` | AI response rendering |
| `lucide-react` | 460+ medical & UI icons |
| `sonner` | Toast notifications |
| `date-fns` | Date formatting |
| `face-api.js` | Browser face detection (CDN) |
| `embla-carousel-react` | Carousel component |
| `cmdk` | Command palette |
| `next-themes` | Dark/light mode |

---

## Contributing

This is a **Hack India** hackathon project. Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is created for **Hack India** hackathon. All rights reserved by the CuraSense Team.

---

## Author

**Abhix6677** — [GitHub Profile](https://github.com/Abhix6677)

---

<div align="center">

### *Built for Hack India*

![Hack India](https://img.shields.io/badge/Hack-India%202026-FF6B6B?style=for-the-badge)

**CuraSense AI** — *Smarter care, together.*

</div>
