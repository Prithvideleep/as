import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-primary)",
      }}
    >
      <Sidebar />
      {/*
        overflow:hidden here — each page is responsible for its own scroll.
        Chat needs a fixed-height flex column; other pages get a scrollable wrapper.
      */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
