# Cognition-Adobe-Image-Upload

A full-stack demonstration application for image upload and thumbnail generation. Users can upload images through a React-based interface, and the server automatically generates 200px-wide thumbnails.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm

## Installation

Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Starting the Application

### Server

Start the Express server from the `server` directory:

```bash
cd server
npm start
```

The server runs on **port 4000** by default. You can configure this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

### Client

Start the Vite development server from the `client` directory:

```bash
cd client
npm run dev
```

The client runs on **port 5173** by default. The Vite dev server proxies `/api` and `/uploads` requests to the backend server at `http://localhost:4000`.

## Upload Directory

Uploaded files are stored in `server/uploads/`. This directory is automatically created when the server starts if it does not already exist.

Both original images and generated thumbnails are saved in this directory:
- Original: `{sanitized_filename}_{timestamp}.{ext}`
- Thumbnail: `{sanitized_filename}_{timestamp}_thumb.{ext}`

**Note:** The server expects to be run from the project root directory (or with `server/` as a subdirectory of the current working directory) for the uploads path to resolve correctly.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check endpoint, returns `{ ok: true }` |
| `/api/upload` | POST | Upload an image file (multipart/form-data with field name `file`), returns `{ url, thumbnailUrl }` |
| `/uploads/*` | GET | Static file serving for uploaded images and thumbnails |

## Project Structure

```
Cognition-Adobe-Image-Upload/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   └── imageUploader.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── index.js
│   ├── package.json
│   └── uploads/            # Auto-created directory for uploaded files
└── README.md
```
