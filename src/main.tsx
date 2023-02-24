import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "flowbite";
import { BrowserRouter, useRoutes } from "react-router-dom";
import Layout from "./Layout";
import routes from "./routes";

function App() {
  const element = useRoutes(routes);
  return (
    <Layout>
      <Suspense>{element}</Suspense>
    </Layout>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
