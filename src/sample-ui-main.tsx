// Entry point for the Sample UI demo page (sample-ui.html).
// Vite loads this file, and it mounts the SampleUI component into the page.
import React from "react";
import ReactDOM from "react-dom/client";
import { SampleUI } from "./examples/SampleUI.tsx";
import "./index.css";

// The id of the empty <div> in sample-ui.html that React renders into.
const ROOT_ELEMENT_ID = "root";

// Find that element. getElementById returns null if the id is missing, so
// check for that and fail loudly instead of letting React crash later.
const rootElement = document.getElementById(ROOT_ELEMENT_ID);
if (rootElement === null) {
  throw new Error("sample-ui.html is missing the root element to render into");
}

// StrictMode is a React development aid: it runs some checks twice to
// surface bugs early. It has no effect in the production build.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SampleUI />
  </React.StrictMode>,
);
