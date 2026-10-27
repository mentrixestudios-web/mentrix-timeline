import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Juego from "@/pages/Juego";
import Categorias from "@/pages/Categorias";
import DesafioDiario from "@/pages/DesafioDiario";
import Estadisticas from "@/pages/Estadisticas";
import Perfil from "@/pages/Perfil";
import { scheduleTimelineNotifications } from "@/utils/notificationSystem";

export default function App() {
  useEffect(() => {
    scheduleTimelineNotifications();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/juego" element={<Juego />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/desafio" element={<DesafioDiario />} />
          <Route path="/estadisticas" element={<Estadisticas />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster 
        theme="dark" 
        position="top-center" 
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }
        }} 
      />
    </Router>
  );
}
