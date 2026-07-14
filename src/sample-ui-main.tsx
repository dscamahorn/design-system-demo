import React from "react";
import ReactDOM from "react-dom/client";
import { SampleUI } from "./examples/SampleUI.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SampleUI />
  </React.StrictMode>
);
