# Real-time Detection System (Full Project)

## Overview
Full-stack web application for real-time human/object/weapon detection using:
- Frontend: HTML/CSS/JavaScript (multi-page)
- Backend: Node.js (Express) - serves frontend + API endpoints (detect proxy, alerts, logs, settings, users)
- Detector: Python (Flask + ultralytics YOLOv8) - detection API

## Quick start (Linux / WSL / macOS recommended)

1. Start Python detector:
```bash
cd python_detector
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python detector.py
```

2. Start Node backend:
```bash
cd backend
npm install
node app.js
```

3. Open browser: http://localhost:3000

## Notes
- The detector will download YOLO weights (yolov8s.pt) on first run (internet required).
- To enable GPU set environment variable `USE_CUDA=true` and have CUDA configured; otherwise CPU is used.
- Email/SMS features are implemented as placeholders. Configure environment variables for real providers.
