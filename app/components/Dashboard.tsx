import { useState } from "react";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import { PredictionView } from "./dashboard/PredictionView";
import { useAuth } from "../context/AuthContext";
import { AdminView } from "./dashboard/AdminView";
import { HistoryView } from "./dashboard/HistortView";
import CreditsView from "./dashboard/CreditsView";
import SettingsView from "./dashboard/SettingsView";
// import { Selftest } from "./dashboard/Selftest";
// import Chat from "./dashboard/Chat";

export default function Dashboard() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<
    "predict" | "history" | "credits" | "settings" | "admin" 
    // | 
    // "self"
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
      // case "self":
      //   return <Selftest />;
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
