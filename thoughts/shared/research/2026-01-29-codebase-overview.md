# Codebase Overview: Adobe Curse

## Analysis: Image Upload Application

### Overview

The application is a full-stack image upload flow: a React (Vite) client lets users select an image file and upload it via a form; an Express server receives the file with Multer, saves it to disk, generates a 200px-wide thumbnail with Sharp, and returns both the original file URL and the thumbnail URL. The client displays the thumbnail in a preview area. The dev client proxies `/api` and `/uploads` to the backend so the same-origin API and static file URLs work during development.

---

### Entry Points

**Client**

- `client/index.html:12` – Root HTML; mounts the app by loading `/src/main.tsx` as a module.
- `client/src/main.tsx:6-9` – React entry: `createRoot(document.getElementById('root')!)` renders `<App />` inside `React.StrictMode`.
- `client/src/App.tsx:4-11` – Root component: renders a constrained layout and a single child `<ImageUploader />`.

**Server**

- `server/index.js` – Express app: configures CORS, JSON, static `/uploads`, Multer storage, and routes. Listens on `PORT` (default 4000).

**Routes**

- `server/index.js:44-46` – GET `/api/health` returns `{ ok: true }`.
- `server/index.js:50-76` – POST `/api/upload` with `upload.single('file')` handles the image upload and thumbnail generation.

---

### Core Implementation

#### 1. Client bootstrap and routing (`client/src/main.tsx`, `client/index.html`)

- `index.html` defines `<div id="root">` and a script tag for `/src/main.tsx` (`client/index.html:11-12`).
- `main.tsx` imports `App` and renders it into `#root` with `createRoot` and `StrictMode` (`client/src/main.tsx:6-9`). No router; the only view is `App` → `ImageUploader`.

#### 2. App shell (`client/src/App.tsx:4-11`)

- Default-export function component with no props or state.
- Renders a wrapper `div` (max-width 640px, centered, Inter/system font) containing an `h1` "Image Upload App" and `<ImageUploader />` (`client/src/App.tsx:6-9`).

#### 3. ImageUploader component (`client/src/components/imageUploader.tsx`)

**State (`client/src/components/imageUploader.tsx:6-9`)**

- `file`: `File | null` – selected file from the file input.
- `thumbSrc`: `string | null` – URL (path) used for the thumbnail `<img src>`.
- `error`: `string | null` – error message shown to the user.
- `loading`: boolean – disables the upload button and shows "Uploading…" during the request.

**File selection (`client/src/components/imageUploader.tsx:11-13`)**

- `onChange` handles the file input’s `change` event.
- Sets `file` to the first selected file or `null`: `setFile(e.target.files?.[0] ?? null)`.

**Upload flow (`client/src/components/imageUploader.tsx:16-36`)**

- `onUpload` runs when the user clicks Upload. If `!file`, it returns immediately.
- Sets `loading` true and `error` null.
- Builds a `FormData`, appends the file under the key `'file'`, and POSTs to `/api/upload` with axios, setting `Content-Type: multipart/form-data` (`client/src/components/imageUploader.tsx:21-25`).
- On success: reads `res.data?.thumbnailUrl` into `tUrl` and calls `setThumbSrc(tUrl ?? null)` (`client/src/components/imageUploader.tsx:29-30`). Also logs the response and, if `thumbnailUrl` is missing, logs a console warning.
- On failure: sets `error` from `err?.message` or `'Upload failed'` (`client/src/components/imageUploader.tsx:32-33`).
- In `finally`: sets `loading` false (`client/src/components/imageUploader.tsx:35`).

**UI (`client/src/components/imageUploader.tsx:40-64`)**

- File `<input type="file" accept="image/*" onChange={onChange}>`.
- Upload `<button>` wired to `onUpload`, disabled when `!file || loading`; label is "Uploading…" when loading, else "Upload".
- Conditional error paragraph using `error`.
- "Thumbnail Preview" section: a 200×200 box that shows either an `<img src={thumbSrc}>` when `thumbSrc` is set, or "(blank)" when not.

#### 4. Vite dev proxy (`client/vite.config.ts:7-18`)

- Dev server runs on port 5173 (`client/vite.config.ts:8`).
- Requests to `/api` and `/uploads` are proxied to `http://localhost:4000` with `changeOrigin: true` (`client/vite.config.ts:9-17`). So from the client’s perspective, `/api/upload` and `/uploads/...` are same-origin and point to the Express server.

#### 5. Server setup (`server/index.js:1-25`)

- Express app created at line 9. `PORT` is `process.env.PORT` or 4000 (`server/index.js:10`).
- `cors()` and `express.json()` mounted (`server/index.js:13-14`).
- Upload directory: `uploadsDir = path.join(process.cwd(), 'server', 'uploads')`. If it does not exist, it is created with `fs.mkdirSync(uploadsDir, { recursive: true })` (`server/index.js:18-21`). When the server is run from the `server/` directory, this resolves to `server/server/uploads`.
- Static files: `app.use('/uploads', express.static(uploadsDir))` so files under `uploadsDir` are served at `/uploads/<filename>` (`server/index.js:24-25`).

#### 6. Multer storage (`server/index.js:28-41`)

- `multer.diskStorage` used with two functions:
  - `destination`: passes `uploadsDir` so files are written there (`server/index.js:30-32`).
  - `filename`: takes `file.originalname`, gets extension and base name; base name is sanitized with `.replace(/[^a-z0-9_-]/gi, '_')`; then `${base}_${Date.now()}${ext}` is used as the filename (`server/index.js:33-37`).
- `multer({ storage })` is created and used as `upload` (`server/index.js:41`).

#### 7. POST /api/upload handler (`server/index.js:50-76`)

- Route: `upload.single('file')` so the multipart field must be named `file` and a single file is accepted.
- If `req.file` is missing, responds with 400 and `{ error: 'No file uploaded' }` (`server/index.js:52-54`).
- Builds `fileUrl = '/uploads/' + file.filename` (`server/index.js:57`).
- Thumbnail: `thumbName` is the original filename with the extension replaced by `_thumb` + extension (e.g. `foo.jpg` → `foo_thumb.jpg`) (`server/index.js:61`). `thumbPath` is the full path in `uploadsDir`. Sharp reads the uploaded file at `file.path`, resizes to width 200 (height auto), and writes to `thumbPath` (`server/index.js:63-64`). `thumbUrl = '/uploads/' + thumbName` (`server/index.js:65`).
- Success response: `res.json({ url: fileUrl, thumbnailUrl: thumbUrl })` (`server/index.js:68-71`).
- On catch: `console.error(err)`, then 500 with `{ error: 'Upload failed' }` (`server/index.js:73-74`).

---

### Data Flow

1. **User selects file**  
   File input `onChange` → `onChange` in `imageUploader.tsx:11-13` → `setFile(e.target.files?.[0] ?? null)`.

2. **User clicks Upload**  
   Button `onClick` → `onUpload` in `imageUploader.tsx:16-36` → `FormData` with `file` → axios POST to `/api/upload`.

3. **Vite proxy**  
   Request to `http://localhost:5173/api/upload` is proxied by Vite (`vite.config.ts:10-13`) to `http://localhost:4000/api/upload`.

4. **Server receives request**  
   Express receives at `server/index.js:50`. Multer parses multipart and writes the file to `uploadsDir` with the generated filename; `req.file` holds `path`, `filename`, etc.

5. **Thumbnail and response**  
   Handler at `server/index.js:51-71` builds `fileUrl`, generates thumbnail with Sharp to `thumbPath`, builds `thumbUrl`, responds with `{ url, thumbnailUrl }`.

6. **Client handles response**  
   Axios resolves; `imageUploader.tsx:29-30` sets `thumbSrc` from `res.data?.thumbnailUrl ?? null`. Re-render shows the thumbnail `<img src={thumbSrc}>`; the browser loads the image from the same origin (via proxy) at `/uploads/<thumbName>`.

7. **Serving the thumbnail**  
   Request to `/uploads/<thumbName>` is proxied to the server (`vite.config.ts:14-17`); Express serves the file from `express.static(uploadsDir)` (`server/index.js:25`).

---

### Key Patterns

- **Component composition**: Single-page UI with `App` → `ImageUploader`; no routing.
- **Controlled file input**: Selection stored in React state (`file`); upload triggered by a separate button.
- **Single-file Multer**: `upload.single('file')` with custom `diskStorage` for deterministic filenames and directory.
- **Sync thumbnail generation**: Thumbnail is created in the request handler with Sharp before sending the JSON response; no queue or background job.
- **Proxy in development**: Vite proxies `/api` and `/uploads` to the Express server so the client uses relative URLs and same-origin semantics.

---

### Configuration

- **Server port**: `process.env.PORT` or 4000 (`server/index.js:10`).
- **Client dev port**: 5173 (`client/vite.config.ts:8`).
- **Upload directory**: `path.join(process.cwd(), 'server', 'uploads')` (`server/index.js:18`); created if missing.
- **Thumbnail size**: Sharp `resize(200)` (width 200, height auto) (`server/index.js:64`).
- **Multer filename**: Sanitized base name + `_` + `Date.now()` + original extension (`server/index.js:34-36`).

---

### Error Handling

- **Client**  
  - No file: upload button disabled via `!file` (`imageUploader.tsx:43`).  
  - Request failure: catch in `onUpload` sets `error` from `err?.message` or `'Upload failed'`; message rendered in red (`imageUploader.tsx:32-33`, `48-50`).

- **Server**  
  - No `req.file`: 400 JSON `{ error: 'No file uploaded' }` (`server/index.js:52-54`).  
  - Any exception in the handler: `console.error`, 500 JSON `{ error: 'Upload failed' }` (`server/index.js:73-74`).

---

### Dependencies

- **Client**: react, react-dom (UI); axios (HTTP); vite, @vitejs/plugin-react, typescript (build).
- **Server**: express (HTTP), cors (CORS), multer (multipart/file), sharp (image resize), path/fs (Node built-ins). `package.json` also lists `mime` but it is not imported in `index.js`.

---

### File Reference Summary

| Role | File |
|------|------|
| HTML entry | `client/index.html` |
| React entry | `client/src/main.tsx` |
| Root component | `client/src/App.tsx` |
| Upload UI | `client/src/components/imageUploader.tsx` |
| Vite config | `client/vite.config.ts` |
| Server entry & routes | `server/index.js` |
