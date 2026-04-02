# FRIDAY Finance Dashboard 📊

A premium personal finance management system built with **FastAPI** (Python) and **React** (Vite). It features real-time analytics for spending, investment tracking (Gold, Property, etc.), and custom category management.

<!-- uvicorn app.main:app --reload --port 8001 -->
<!-- npm run dev -->

## Features
- **Overview Dashboard**: Visual analytics with charts (Spending Trends & Asset Allocation).
- **Spending Tracker**: Log daily expenses with categories.
- **Investment Management**: Track assets like Gold and Property.
- **Category Manager**: Customize your expense tags.
- **Auto-Seeding**: Comes pre-loaded with sample data upon first run.

## Tech Stack
- **Frontend**: React, Vite, Chart.js, Framer Motion, Lucide Icons, Vanilla CSS.
- **Backend**: FastAPI, Motor (Async MongoDB), Pydantic.
- **Database**: MongoDB (Localhost).

## Project Structure
- `/backend`: Python FastAPI server.
- `/frontend`: React client with Vite.

## How to Run

### 1. Prerequisites
- MongoDB running on `localhost:27017`.
- Python 3.10+
- Node.js 18+

### 2. Start Backend
```bash
cd backend
python3 main.py
```
*The server will run at http://localhost:8000*

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
*The dashboard will run at http://localhost:5173*

## Dashboard Design
The dashboard uses a premium **Slate Dark Theme** with glassmorphism effects and smooth Framer Motion transitions.
