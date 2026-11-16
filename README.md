# CarePulse | Interactive Appointment Slot & Queue Tracker

> A modern, responsive clinic appointment booking and real-time OPD queue tracking application designed for doctors and diagnostic laboratories. Built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Vite**.

![CarePulse Banner](https://img.shields.io/badge/CarePulse-Live%20Queue%20%26%20Booking-0d9488?style=for-the-badge&logo=heartbeat&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 🚀 Key Requirements & Technical Implementations

### 1. Pick a Slot & Lock It (2-Minute Exclusive Reservation)
- **Interactive Schedule Grid**: Real-time slots filtered across Morning (`09:00 AM – 12:00 PM`), Afternoon (`12:00 PM – 04:00 PM`), and Evening (`04:00 PM – 07:00 PM`) for both Doctor Consultations and Diagnostic Tests.
- **2-Minute Lock**: When a user selects an available slot, it is immediately locked exclusively for **120 seconds** (`Date.now() + 120000`).
- **Live Visual Feedback**: 
  - Dynamic `MM:SS` countdown timer.
  - Smooth animated progress bar shrinking proportionally to time remaining.
  - Color-shifting urgency cues (Teal $\rightarrow$ Amber at 30s $\rightarrow$ Pulsing Crimson at 10s).
  - Floating status pill in the persistent navbar showing the active reservation.
- **Cross-Tab Synchronization**: Powered by the browser `BroadcastChannel` API; if a user locks a slot in one tab, other tabs immediately receive the update.

### 2. Auto-Timeout Release
- **Automatic Deallocation**: When the 120-second timer hits zero, the slot is immediately released and reverted to `'available'` status.
- **User Notification**: A friendly, accessible **Hold Window Expired** modal informs the user that their hold timed out, preventing phantom bookings while keeping the schedule fair for all patients.
- **Zero Form Leakage**: Clears the active lock state and allows immediate one-click re-selection of any open slot.

### 3. Live Clinic Queue Status & Position Tracker
- **Dedicated Queue View**: One-click toggle between **"Book Slot"** and **"Live Queue"**.
- **Confirmed Patient Pass Card**:
  - Assigned Token Number (e.g. `#103`).
  - Booking Reference code (e.g. `BK-8903`).
  - Clinic Room / Bay locator.
  - **Live Position**: Exact count of patients ahead (e.g., *"1 patient ahead of you"*).
  - **Dynamic Estimated Wait Time**: Calculated in real-time as `patientsAhead * avgConsultationMinutes` (updates dynamically as clinic advances).
- **Public OPD Board**: Shows today's active tokens (`In Consultation`, `Waiting`, `Completed`).
- **Interactive Clinic Simulator**: Built-in *"Call Next Token"* button to test queue progression and watch estimated wait times drop in real-time.
- **Token Lookup**: Patients can search any existing appointment by Token Number, Phone, or Booking ID.

### 4. Refresh Resilience (Bulletproof F5 Protection)
- **Timestamp-Based Storage**: Unlike naive `setInterval` countdowns that reset to `02:00` on page reload, CarePulse calculates remaining time strictly via absolute timestamps:
  $$\text{remainingSeconds} = \max\left(0, \left\lceil \frac{\text{expiresAt} - \text{Date.now()}}{1000} \right\rceil\right)$$
- **State & Draft Preservation**: If a patient is midway through typing their name or phone number and accidentally refreshes (or closes and reopens the tab within 2 minutes), their timer resumes with exact precision and their form inputs are preserved.
- **Session Cleanup**: If the page is reloaded after the timer has naturally expired, it performs instant cleanup and displays the timeout notification.

---

## 🛠️ Tech Stack & Architecture

- **UI Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/vite`
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **State & Persistence**: React Context API + LocalStorage + SessionStorage
- **Cross-Tab Sync**: BroadcastChannel API (`carepulse_sync_channel`)
- **Build Tool**: Vite 8.3

---

## 🧪 Evaluator Sandbox Controls

A sticky header sandbox is provided at the very top of the page specifically for quick evaluation:
1. **⚡ Fast-forward to 5s**: Instantly skips the 2-minute timer to 5 seconds remaining to test timeout behavior without waiting.
2. **⏩ Next Patient**: Simulates the doctor finishing a consultation and calling the next token.
3. **🛡️ Refresh Test**: Press `F5` / Reload at any point during a lock to verify that the timer does not reset.
4. **♻️ Reset**: Wipes local test state and restores the default clinic schedule.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ (or Bun 1.2+)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/interactive-appointment-queue-tracker.git
cd interactive-appointment-queue-tracker

# Install dependencies (using bun or npm)
bun install
# or
npm install

# Start local development server
bun run dev
# or
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build
```bash
bun run build
# or
npm run build

# Preview production build
bun run preview
# or
npm run preview
```

---

## 🌐 Deploy to Free Hosting

### Deploying to Vercel (Recommended)
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework preset: **Vite** (defaults will be detected automatically).
5. Click **Deploy**.

### Deploying to Netlify
1. Go to [netlify.com](https://netlify.com) and select **"Add new site"** $\rightarrow$ **"Import an existing project"**.
2. Connect to GitHub and select this repository.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy Site**.

### Deploying to StackBlitz
1. Open [stackblitz.com](https://stackblitz.com).
2. Select **"Import from GitHub"** and paste your repository link.

---

## 📄 License
MIT © 2026 CarePulse Health Systems
