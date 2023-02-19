import { Fragment } from "react";
import { useRoutes } from "react-router-dom";
import Layout from "./components/Layout";
import routes from "./routes";
export default function App() {
  const element = useRoutes(routes);
  return <Layout>{element}</Layout>;
}
