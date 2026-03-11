import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DashboardLayout from "./layouts/DashboardLayout.tsx";


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <DashboardLayout children={undefined} />
    </StrictMode>,
)
