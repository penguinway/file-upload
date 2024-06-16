import React from "react";
import { createRoot } from "react-dom/client";
import FileUploadPage from './upload/upload'
import "@arco-design/web-react/dist/css/arco.css";

const root = createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <FileUploadPage />
    </React.StrictMode>
);