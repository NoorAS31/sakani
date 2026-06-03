import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from "./App.tsx";
import { ThemeProvider } from './context/ThemeContext.tsx';

const isDevelopment = import.meta.env.DEV;

const root = createRoot(document.getElementById('root')!);

if (isDevelopment) {
    root.render(
        <ThemeProvider>
            <App/>
        </ThemeProvider>,
    );
} else {
    root.render(
        <StrictMode>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </StrictMode>,
    );
}
