import "../components/common/Navbar/Navbar";
import Navbar from "../components/common/Navbar/Navbar";
import Sidebar from "../components/common/Sidebar/Sidebar";
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
