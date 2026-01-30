import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';


const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());


// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
if (!fs.existsSync(uploadsDir)) {
fs.mkdirSync(uploadsDir, { recursive: true });
}


// Static hosting for uploaded files
app.use('/uploads', express.static(uploadsDir));


// Multer storage config
const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, uploadsDir);
},
filename: function (req, file, cb) {
const ext = path.extname(file.originalname);
const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
const timestamp = Date.now();
cb(null, `${base}_${timestamp}${ext}`);
}
});


const upload = multer({ storage });


app.get('/api/health', (req, res) => {
res.json({ ok: true });
});


// Intentional demo route (has the bug: only returns `url`, not `thumbnailUrl`)
app.post('/api/upload', upload.single('file'), async (req, res) => {
try {
const file = req.file; // e.g., { path, filename, ... }
if (!file) {
return res.status(400).json({ error: 'No file uploaded' });
}


const fileUrl = `/uploads/${file.filename}`;


// Generate a small thumbnail alongside original (but DO NOT return it yet)
const thumbName = file.filename.replace(/(\.[^.]+)$/i, '_thumb$1');
const thumbPath = path.join(uploadsDir, thumbName);
await sharp(file.path).resize(200).toFile(thumbPath);
const thumbUrl = `/uploads/${thumbName}`;


    return res.json({
        url: fileUrl,
        thumbnailUrl: thumbUrl
    });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Upload failed' });
}
});


app.listen(PORT, () => {
console.log(`Server listening on http://localhost:${PORT}`);
});