import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar/Navbar";
import Sidebar from "../components/common/Sidebar/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

function PageTransition() {
  const location = useLocation();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    setVisivel(false);

    const frame = requestAnimationFrame(() => setVisivel(true));

    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div className={`fade ${visivel ? "show" : ""}`}>
      <Outlet />
    </div>
  );
}

function MainLayout() {
  const [menuAberto, setMenuAberto] = useState(true);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar
        titulo="MercFlow BETA"
        menuAberto={menuAberto}
        onAlternarMenu={() => setMenuAberto((aberto) => !aberto)}
      />

      <div className="container-fluid flex-grow-1">
        <div className="row min-vh-100">
          <Sidebar aberto={menuAberto} onNavegar={() => setMenuAberto(false)} />

          <main className="col-lg-10 px-3 px-lg-4 py-4">
            <PageTransition />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
