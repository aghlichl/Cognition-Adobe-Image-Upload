import { useState } from 'react';
import axios from 'axios';


export default function ImageUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [thumbSrc, setThumbSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
    };


    const onUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await axios.post('/api/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('Upload API response:', res.data);
            if (!res.data?.thumbnailUrl) console.warn('Missing thumbnailUrl in API response', res.data);

            const tUrl: string | undefined = res.data?.thumbnailUrl; // undefined → bug manifests
            setThumbSrc(tUrl ?? null);
        } catch (err: any) {
            setError(err?.message ?? 'Upload failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
            <input type="file" accept="image/*" onChange={onChange} />
            <button onClick={onUpload} disabled={!file || loading} style={{ marginLeft: 8 }}>
                {loading ? 'Uploading…' : 'Upload'}
            </button>


            {error && (
                <p style={{ color: 'crimson', marginTop: 12 }}>Error: {error}</p>
            )}


            <div style={{ marginTop: 16 }}>
                <strong>Thumbnail Preview:</strong>
                <div style={{ marginTop: 8, width: 200, height: 200, border: '1px dashed #aaa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {thumbSrc ? (
                        <img src={thumbSrc} alt="thumbnail" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                        <span style={{ color: '#777' }}>(blank)</span>
                    )}
                </div>
            </div>
        </div>
    );
}