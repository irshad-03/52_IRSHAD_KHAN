# Financial Report Generator

An automated MD&A (Management Discussion & Analysis) report generation system with RAG (Retrieval-Augmented Generation) capabilities. This application allows users to upload financial data and automatically generate comprehensive financial reports with visualizations and PDF export functionality.

## Features

- 🔐 **User Authentication**: Complete authentication system with Firebase (Register, Login, Logout, Password Reset)
- 👤 **Profile Management**: Edit profile information, upload profile images, change password
- 📊 **Financial Analysis**: Automatic calculation of YoY/QoQ changes and KPIs
- 🤖 **AI-Powered Reports**: RAG-based MD&A report generation using LangChain and OpenAI
- 📈 **Data Visualization**: Interactive charts for financial trends
- 📄 **PDF Export**: Download reports as PDF with customizable fonts
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** (React framework)
- **TypeScript** (Type safety)
- **Tailwind CSS** (Styling)
- **Firebase** (Authentication & Storage)
- **Recharts** (Chart visualization)
- **jsPDF** (PDF generation)

### Backend
- **FastAPI** (Python web framework)
- **Pandas** (Data processing)
- **LangChain** (LLM orchestration)
- **OpenAI** (Embeddings & Chat models)
- **ChromaDB** (Vector database for RAG)
- **Pydantic** (Data validation)

## Project Structure

```
financial-report-generator/
├── app/                    # Next.js app directory
│   ├── account/           # Account management page
│   ├── dashboard/         # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home/login page
├── components/            # React components
│   ├── Login.tsx          # Authentication component
│   ├── Navbar.tsx         # Navigation bar
│   ├── FileUpload.tsx     # File upload component
│   ├── ReportGenerator.tsx # Report generation UI
│   ├── ChartDisplay.tsx   # Chart visualization
│   └── PDFExport.tsx      # PDF export component
├── context/               # React contexts
│   └── AuthContext.tsx    # Authentication context
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   └── auth.ts            # Authentication helpers
├── backend/               # Python backend
│   ├── main.py            # FastAPI application
│   └── services/          # Business logic
│       ├── financial_analyzer.py  # Financial analysis
│       └── report_generator.py    # Report generation with RAG
└── requirements.txt       # Python dependencies
```

## Setup Instructions

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.9+
- **Firebase Project** (for authentication)
- **OpenAI API Key** (for LLM features)

### Step 1: Clone and Navigate to Project

```bash
cd financial-report-generator
```

### Step 2: Frontend Setup

1. **Install dependencies**:
```bash
npm install
# or
yarn install
```

2. **Create `.env.local` file** in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Run development server**:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

### Step 3: Backend Setup

1. **Create virtual environment** (recommended):
```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

2. **Install Python dependencies**:
```bash
pip install -r ../requirements.txt
```

3. **Create `.env` file** in the `backend` directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
API_HOST=0.0.0.0
API_PORT=8000
```

4. **Run FastAPI server**:
```bash
python main.py
# or
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### Step 4: Firebase Setup

1. **Create a Firebase project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Storage

2. **Get Firebase configuration**:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Add a web app or use existing
   - Copy the configuration values to `.env.local`

3. **Configure Firestore**:
   - Go to Firestore Database
   - Create database in test mode (for development)
   - Create a collection named `users`

4. **Configure Storage**:
   - Go to Storage
   - Create storage bucket
   - Set up rules for profile images

### Step 5: OpenAI Setup

1. **Get OpenAI API Key**:
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Go to API Keys section
   - Create a new API key
   - Add it to `backend/.env`

## Usage

1. **Start the application**:
   - Frontend: `npm run dev` (runs on port 3000)
   - Backend: `python backend/main.py` (runs on port 8000)

2. **Register/Login**:
   - Go to `http://localhost:3000`
   - Register a new account or login
   - Verify email if required

3. **Upload Financial Data**:
   - Upload a CSV or Excel file with financial data
   - Ensure the file has columns like: date, revenue, expenses, etc.

4. **Generate Report**:
   - Click "Generate Report" button
   - Wait for analysis to complete
   - View the generated MD&A report with charts

5. **Export PDF**:
   - Customize font size and font family
   - Click "Download PDF" to export the report

## CSV File Format

Your CSV/Excel file should have the following structure:

```csv
Date,Revenue,Expenses,Net Income
2023-01-01,1000000,800000,200000
2023-02-01,1100000,850000,250000
2023-03-01,1200000,900000,300000
```

The system will automatically detect:
- Date/Period columns
- Revenue/Sales columns
- Expense/Cost columns
- Other numeric columns

## API Endpoints

- `GET /` - API health check
- `POST /api/analyze` - Analyze financial data and generate report
- `GET /api/health` - Health check endpoint

## Environment Variables

### Frontend (.env.local)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_API_URL`

### Backend (backend/.env)
- `OPENAI_API_KEY` - Required for LLM features
- `API_HOST` - API host (default: 0.0.0.0)
- `API_PORT` - API port (default: 8000)

## Troubleshooting

### Common Issues

1. **Firebase authentication errors**:
   - Verify all Firebase config values in `.env.local`
   - Ensure Authentication is enabled in Firebase Console
   - Check that Email/Password sign-in is enabled

2. **Backend connection errors**:
   - Ensure backend is running on port 8000
   - Check CORS settings in `backend/main.py`
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`

3. **OpenAI API errors**:
   - Verify API key is correct
   - Check API quota/limits
   - Ensure sufficient credits in OpenAI account

4. **File upload issues**:
   - Ensure file is CSV or Excel format
   - Check file size limits
   - Verify file has proper structure

## Deployment

### Frontend Deployment (Firebase Hosting)

```bash
npm run build
firebase init hosting
firebase deploy
```

### Backend Deployment

Options:
- **Heroku**: Use Procfile and deploy via Heroku CLI
- **AWS Lambda**: Use Serverless Framework
- **Google Cloud Run**: Containerize and deploy
- **DigitalOcean**: Use App Platform

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.
