import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Watermark } from '@arco-design/web-react';
import App from "./App";
import "@arco-design/web-react/dist/css/arco.css";

const root = createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Watermark
            content='文件站'>
        <App />
        </Watermark>
    </React.StrictMode>
);