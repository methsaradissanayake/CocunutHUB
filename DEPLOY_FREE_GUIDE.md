# 🥥 CoconutHub — 100% Free Hosting Guide (Best Way)

This guide walks you step-by-step through deploying CoconutHub to the internet completely **FREE** with zero upfront costs or credit cards needed.

---

## 🌟 The 2 Best Free Options

| Feature | **Method 1: Decoupled (Recommended)** | **Method 2: All-in-One Container** |
| :--- | :--- | :--- |
| **Frontend** | **Vercel** (Global Edge CDN, Ultra-fast) | Embedded inside ASP.NET Core |
| **Backend** | **Render.com** (Free Web Service) | **Render.com** / **Fly.io** (Docker) |
| **Database** | **Supabase** / **Neon** (Postgres Free) or SQLite | Built-in SQLite |
| **Cost** | **$0.00 / month** (100% Free forever) | **$0.00 / month** (100% Free forever) |
| **Best For** | Best performance, instant page loads | Single service, easiest management |

---

## 🚀 Method 1 (Recommended): Vercel (Frontend) + Render (Backend)

### Step 1: Push Your Code to GitHub
1. Create a GitHub repository (e.g., `CoconutHub`).
2. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for production deployment"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/CoconutHub.git
   git push -u origin main
   ```

---

### Step 2: Deploy Backend to Render.com (100% Free)
1. Go to [https://render.com](https://render.com) and sign up / log in with your GitHub account.
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and pick your `CoconutHub` repository.
4. Configure settings:
   - **Name**: `coconuthub-api`
   - **Region**: Singapore or Frankfurt (choose nearest to Sri Lanka: Singapore is ideal)
   - **Language**: **Docker**
   - **Dockerfile Path**: `./Dockerfile` (or build context `backend`)
   - **Instance Type**: **Free**
5. (Optional - If using free PostgreSQL from Supabase/Neon):
   - Add Environment Variable:
     - Key: `DATABASE_URL`
     - Value: `postgres://your_supabase_connection_string`
   - If not set, CoconutHub automatically falls back to SQLite!
6. Click **Deploy Web Service**.
7. Once deployed, Render will provide your public backend URL, e.g.:
   `https://coconuthub-api.onrender.com`

---

### Step 3: Deploy Frontend to Vercel (100% Free)
1. Go to [https://vercel.com](https://vercel.com) and sign up / log in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `CoconutHub` GitHub repository.
4. In the setup screen:
   - **Framework Preset**: Vite
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://coconuthub-api.onrender.com/api` (use your Render URL from Step 2)
6. Click **Deploy**.
7. Within 60 seconds, your site is live with a global CDN and free HTTPS:
   `https://coconuthub.vercel.app`

---

## 📦 Method 2: All-in-One Container on Render (Single Service)

If you prefer hosting **everything together** on a single free URL without managing two separate dashboards:

1. Push your repository to GitHub.
2. In [Render.com](https://render.com), click **New +** → **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](file:///c:/My_Projects/CoconutHub/render.yaml).
4. Click **Apply**.
5. Render builds the React frontend, packages it into the .NET API, and serves everything (API + Web pages + SQLite DB) from one unified URL!

---

## 🗄️ Free Database Options (Zero Configuration)

CoconutHub automatically detects your database environment:

1. **Default (Zero Setup - SQLite)**:
   - If no database connection string is provided, CoconutHub will automatically initialize and run on SQLite (`coconuthub_v2.db`) with demo users, Sri Lanka mills, and marketplace listings ready.
2. **Supabase (Free 500MB Postgres)**:
   - Go to [supabase.com](https://supabase.com) → Create Project.
   - Go to **Project Settings** → **Database** → Copy **URI Connection String**.
   - Set as `DATABASE_URL` environment variable on Render. CoconutHub handles the rest automatically!

---

## ✅ Pre-configured In This Codebase

- ✔️ **Dynamic CORS**: Automatically accepts requests from Vercel (`*.vercel.app`), custom domains, and localhost.
- ✔️ **SPA Fallbacks**: Configured in `Program.cs` and `frontend/vercel.json` so page refreshes never 404.
- ✔️ **API Routing**: Configured to work both decoupled (`VITE_API_URL`) and unified (`/api`).
- ✔️ **Multi-stage Dockerfile**: Ready for any container host (Render, Fly.io, Railway, VPS).
