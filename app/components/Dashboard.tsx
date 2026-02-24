import { useState } from "react";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { PredictionView } from "./dashboard/PredictionView";
import { useAuth } from "../context/AuthContext";
import { AdminView } from "./dashboard/AdminView";
import { HistoryView } from "./dashboard/HistortView";
import CreditsView from "./dashboard/CreditsView";
import SettingsView from "./dashboard/SettingsView";
// import Chat from "./dashboard/Chat";

export default function Dashboard() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<
    "predict" | "history" | "credits" | "settings" | "admin"
  >("predict");
  const renderView = () => {
    switch (currentView) {
      case "predict":
        return <PredictionView />;
      case "history":
      return <HistoryView />;
      case "credits":
      return <CreditsView />;
      case "settings":
      return <SettingsView />;
      case "admin":
        return profile?.is_admin ? <AdminView /> : <PredictionView />;
      default:
        return <PredictionView />;
    }
  };
  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </DashboardLayout>
  );
}
