# EndLife - Arknights: Endfield Companion App (Frontend)

<div align="center">
  <h3>Your ultimate companion dashboard and ascension planner for Arknights: Endfield.</h3>
</div>

## 📖 Overview

EndLife is a fan-made, comprehensive companion application designed for the upcoming title *Arknights: Endfield*. Built with modern web technologies and a focus on premium aesthetics, the application serves as a central hub for tracking game progression, managing resources, and exploring game encyclopedias.

This repository holds the **Frontend** of the EndLife application.

## ✨ Features

- **Dynamic Interactive Dashboard**: The main hub mimicking the in-game UI aesthetics, complete with dynamic news banners, daily progress tracking, and ascension planner summaries.
- **Ascension Planner**: A robust tool to plan and track the materials required to upgrade your Characters and Weapons. Manage your T-Creds and material inventory efficiently.
- **Characters & Weapons Directory**: Comprehensive, beautifully designed pages detailing character stats, weapon attributes, skills, and ascension requirements.
- **State of the Art Design**: Highly polished, modern UI utilizing glassmorphism, responsive stacked vertical layouts, micro-animations, and a curated dark-mode color palette that feels native to the Endfield universe.
- **Mobile Responsive**: Fully optimized for mobile screens, ensuring a seamless experience across all devices.

## 🛠️ Technology Stack

The frontend is built with the latest and greatest in the React ecosystem:

- **Framework:** [Next.js](https://nextjs.org/) (App Router, v16+)
- **UI Library:** [React](https://react.dev/) (v19)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) for utility-first responsive styling
- **Animations:** [Framer Motion](https://www.framer.com/motion/) for smooth layout transitions and micro-animations
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for lightweight, global application state
- **Icons:** [Lucide React](https://lucide.dev/)
- **API Client:** [@elysiajs/eden](https://elysiajs.com/plugins/eden/overview.html) for end-to-end type safety with the ElysiaJS backend.

## 🚀 Getting Started

Follow these steps to set up the frontend development environment.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Bun](https://bun.sh/) (Optional but recommended for faster package management)
- The **EndLife Backend** server must be running locally to feed data to the frontend.

### Installation

1. **Clone the repository** (if you haven't already and are setting this up independently):
   ```bash
   git clone <repository-url>
   cd endlife-fe
   ```

2. **Install dependencies**:
   Using npm:
   ```bash
   npm install
   ```
   Or using Bun:
   ```bash
   bun install
   ```

3. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory. You will likely need to define your backend API URL if not running on the default local port.
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000 # Example, adjust to your backend port
   ```

4. **Run the Development Server**:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open the Application**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) to view the application in development mode.

## 📁 Project Structure

```text
endlife-fe/
├── app/                  # Next.js App Router root (Pages, Layouts, Routing)
│   ├── admin/            # Admin management pages
│   ├── dashboard/        # Main user dashboard, planner, and encyclopedia pages
│   └── layout.tsx        # Root application layout
├── components/           # Reusable UI components (Cards, Modals, Inputs, etc.)
├── lib/                  # Utility functions and API configuration
│   └── api/              # Eden API client setup (auth, fetching)
├── store/                # Zustand global state stores
├── public/               # Static assets (images, icons)
├── package.json          # Project dependencies and scripts
└── eslint.config.mjs     # ESLint configuration
```

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the UI, add new features, or fix bugs, please submit a Pull Request.

## 📄 License

This project is created for educational and community purposes. All Arknights: Endfield related assets, names, and concepts belong to Hypergryph / Gryphline.
