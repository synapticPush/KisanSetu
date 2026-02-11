# 🌾 KisanSetu – Smart Farm Management System

**KisanSetu** is a modern, full-stack farm management application designed specifically for farmers to manage their agricultural operations efficiently.  
It provides tools to track fields, yields, finances, labour, transportation, and more — all in one place.

Built with a **FastAPI backend** and a **React frontend**, KisanSetu is optimized for both **desktop and mobile use** and can be installed as a **Progressive Web App (PWA)**.

---

## 🚀 Features

### 🌱 Field Management
- Add and manage multiple farm fields
- Track field size and location
- Associate yields and expenses with specific fields

### 🥔 Yield Tracking
- Record potato yields by size:
  - Small
  - Medium
  - Large
  - Overlarge
- View total yield statistics

### 💰 Financial Management
- Track all farm expenses
- Monitor income and labour payments
- Get profit/loss estimates

### 👷 Labour Management
- Add labourers
- Record attendance
- Track payments and balances
- View work history

### 📦 Lot Number Management
- Manage storage lot numbers
- Track packet counts by type
- Maintain storage history

### 🚚 Transportation Tracking
- Record transportation of produce
- Automatically update lot storage
- Maintain transportation history

### 📊 Dashboard & Analytics
- Real-time farm statistics
- Yield summaries
- Labour costs
- Profit/loss estimation
- Weather forecast (7-day)

### 🌐 Multi-Language Support
- English and Hindi language toggle
- Designed for real-world farmer usability

### 📱 Mobile Ready
- Progressive Web App (PWA)
- Installable on Android devices
- Works offline (basic caching)

---

## 🏗️ Tech Stack

### Frontend
- React
- Tailwind CSS
- React Router
- Axios

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL (Supabase)
- JWT Authentication

### Deployment
- Frontend: Cloudflare Pages
- Backend: Render
- Database: Supabase

---

## ⚙️ Environment Variables

Create a `.env` file in the backend directory with:

DATABASE_URL=your_postgres_database_url
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE_MINUTES=720
ACCESS_TOKEN_EXPIRE_MINUTES=720
WEATHER_API_KEY=your_weather_api_key

---






