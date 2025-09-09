# SysNova Admin Dashboard

A modern, full-featured administrative dashboard built with Next.js 15, TypeScript, and Tailwind CSS. SysNova provides comprehensive user management, analytics, and role-based access control in a clean, responsive interface.

## ✨ Features

### 🔐 Authentication & Security
- Secure sign-in with email/password authentication
- Role-based access control (Admin, Editor, Viewer)
- Protected routes and authorization

### 👥 User Management
- Complete CRUD operations for users
- Bulk user operations (delete, status update, role assignment)
- User import/export functionality
- Advanced filtering and search capabilities
- User profile management with detailed information

### 📊 Analytics Dashboard
- Real-time metrics and KPI tracking
- Interactive charts and visualizations using Recharts
- Monthly revenue and user growth analytics
- Device usage statistics
- Activity monitoring and recent user actions

### 🎨 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Dark/light theme support
- Modern components with Radix UI primitives
- Smooth animations and transitions
- Mobile-first responsive layout

### 🛠️ Additional Features
- Global state management with React Context
- Toast notifications for user feedback
- Modal dialogs for forms and confirmations
- Sidebar navigation with collapsible menu
- Type-safe forms with React Hook Form and Zod validation

## 🚀 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Charts:** Recharts, ApexCharts, ECharts
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Theme:** next-themes for dark/light mode

## 📁 Project Structure

```
sysnova-admin/
├── app/                    # Next.js app directory
│   ├── dashboard/          # Dashboard pages
│   │   ├── users/         # User management
│   │   ├── analytics/     # Analytics & reports
│   │   ├── settings/      # Application settings
│   │   └── ...           # Other dashboard pages
│   ├── signin/            # Authentication pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   └── ...               # Feature-specific components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility functions and APIs
└── public/               # Static assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/shawon9324/sysnova-admin-nextjs.git
cd sysnova-admin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Login

For testing purposes, you can use any email and password combination to access the dashboard.

## 📦 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🎯 Key Pages

- **Sign In** (`/signin`) - Authentication page with modern design
- **Dashboard** (`/dashboard`) - Analytics overview with charts and metrics
- **Users** (`/dashboard/users`) - Comprehensive user management interface
- **Analytics** (`/dashboard/analytics`) - Detailed analytics and reporting
- **Settings** (`/dashboard/settings`) - Application configuration
- **Access Control** (`/dashboard/access`) - Role and permission management

## 🔧 Configuration

The project includes several configuration files:

- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui component configuration
- `tsconfig.json` - TypeScript configuration

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy SysNova Admin is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and configure the build

### Other Deployment Options

- **Netlify:** Use the `npm run build` command
- **Docker:** Create a Dockerfile based on the Next.js standalone output
- **Self-hosted:** Use `npm run build` and `npm run start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please [open an issue](https://github.com/shawon9324/sysnova-admin-nextjs/issues) on GitHub.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for the accessible component primitives
- [Lucide](https://lucide.dev/) for the beautiful icons
