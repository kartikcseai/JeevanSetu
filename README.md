# JeevanSetu – Smart AI Healthcare Assistant

JeevanSetu is an AI-powered healthcare platform designed to simplify access to healthcare services through a modern web experience. The platform helps users explore healthcare solutions, symptom analysis, doctor-related services, medicines, and lab tests through an intuitive interface.

---

# 🚀 Features

- AI-powered healthcare assistant
- Symptom checker interface
- Doctor-focused services
- Lab test and medicine sections
- Responsive modern UI
- Fast frontend powered by Vite + React
- TailwindCSS + shadcn/ui based design system

---

# 🛠️ Tech Stack

## Frontend
- React
- TypeScript
- Vite
- TailwindCSS
- shadcn/ui

## Tooling & Package Management
- Node.js
- npm

## Deployment
- Vercel

---

# 📁 Project Structure

```bash
.
├── public/             # Static assets
├── src/                # Main application source code
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages/routes
│   ├── assets/         # Images/icons/fonts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility/helper functions
│   └── styles/         # Global styling files
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

# ⚙️ Prerequisites

>Before running the project locally, make sure you have:

Node.js >= 20
npm >= 10

>Check versions:
```bash
node -v
npm -v
```

# 📦 Installation

Clone the repository:
```bash
git clone <repository-url>
```

Move into project directory:        
```bash
cd JeevanSetu
```

Install dependencies:
```bash
npm install
```

# ▶️ Running the Project Locally

Start development server:
```bash
npm run dev
```

The application will start on:
```bash
http://localhost:8080
```

# 🏗️ Build for Production

Create production build:
```bash
npm run build
```

Preview production build locally:
```bash
npm run preview
```

# 🐳 Docker Support

Build Docker image:
```bash
docker build -t jeevansetu .
```

Run container:
```bash
docker run -p 8080:8080 jeevansetu
```

# 🔧 Environment Variables

Create a .env file in the root directory if required.

Example:
```bash
VITE_API_URL=
VITE_APP_NAME=JeevanSetu
```

# 📌 Development Notes
* The project uses Vite as the frontend bundler.
* TailwindCSS is used for styling.
* shadcn/ui is used for reusable UI components.
* Node.js v20+ is recommended for compatibility.


# 🚀 Future DevOps Improvements

Planned DevOps enhancements:

* Docker Compose setup
* GitHub Actions CI/CD
* Automated linting and testing
* Multi-environment deployment
* Multi-environment deployment
* Nginx reverse proxy
* Kubernetes deployment
* Monitoring & logging integration


## 🤝 Contribution Workflow

1 .Create a new branch:
```bash
git checkout -b feature/your-feature-name
```
2. Commit changes:
```bash
git commit -m "Added new feature"
```
3. Push branch:
```bash
git push origin feature/your-feature-name
```
4. Open Pull Request


## 📄 License

This project is currently intended for educational and development purposes.

# 👨‍💻 Contributors
Kartik Gupta
Raunak Pandey
        Project Owner & Contributors

# ⭐ Acknowledgements
React
Vite
TailwindCSS
shadcn/ui
Vercel
Open-source community