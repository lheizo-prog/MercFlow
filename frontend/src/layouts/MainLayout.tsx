import "../components/Navbar/Navbar";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <Navbar titulo="MercFlow BETA" />

      <Sidebar />

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
