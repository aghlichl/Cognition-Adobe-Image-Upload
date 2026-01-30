import ImageUploader from './components/ImageUploader';


export default function App() {
    return (
        <div style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'Inter, system-ui, Arial' }}>
            <h1>Image Upload App</h1>
            <ImageUploader />
        </div>
    );
}
