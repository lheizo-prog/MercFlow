import { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar/Navbar";
import Sidebar from "../components/common/Sidebar/Sidebar";
import BottomNav from "../components/common/BottomNav/BottomNav";
import ScrollToTopButton from "../components/common/ScrollToTopButton/ScrollToTopButton";
import { Outlet, useLocation } from "react-router-dom";

function PageTransition() {
  const location = useLocation();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    // Scroll restoration: rola para o topo imediatamente ao trocar de tela
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
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
  const [menuAberto, setMenuAberto] = useState(false);

  // Rola até o topo da tela ao abrir a sidebar
  const handleAlternarMenu = () => {
    setMenuAberto((aberto) => {
      const proximo = !aberto;
      if (proximo) {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
      return proximo;
    });
  };

  const handleFecharMenu = () => {
    setMenuAberto(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light position-relative">
      <Navbar
        titulo="MercFlow"
        menuAberto={menuAberto}
        onAlternarMenu={handleAlternarMenu}
      />

      {/* Backdrop para mobile quando o menu estiver aberto */}
      {menuAberto && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1020, backdropFilter: "blur(2px)", marginTop: "56px" }}
          onClick={handleFecharMenu}
          aria-hidden="true"
        />
      )}

      <div className="container-fluid flex-grow-1">
        <div className="row min-vh-100">
          <Sidebar aberto={menuAberto} onNavegar={handleFecharMenu} />

          <main className="col-lg-10 px-3 px-lg-4 py-4 pb-5 pb-lg-4">
            <PageTransition />
          </main>
        </div>
      </div>

      <ScrollToTopButton />
      <BottomNav />
    </div>
  );
}

export default MainLayout;
