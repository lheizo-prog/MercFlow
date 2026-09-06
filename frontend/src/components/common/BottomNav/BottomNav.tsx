import { NavLink } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const InicioIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
  </svg>
);

const LancarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM9.5 3A1.5 1.5 0 0 0 8 1.5V3h1.5z"/>
    <path d="M3.5 7a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const ProdutosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.7l-6.5 2.6v7.12a5.37 5.37 0 0 0 1 .06 1 1 0 0 0 .74-.31v-7.12l-6.5-2.6V4.7z"/>
    <path d="M3.5 5.875 8 8.318l4.5-2.443V11.6a1.5 1.5 0 0 0-.5-.868L8 7.934 3.5 5.875z"/>
  </svg>
);

const DeptosIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
    <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
  </svg>
);

function BottomNav() {
  
  const items: NavItem[] = [
    { to: "/", icon: <InicioIcon />, label: "Inicio" },
    { to: "/lancamentos", icon: <LancarIcon />, label: "Lancar" },
    { to: "/produtos_mercearia", icon: <ProdutosIcon />, label: "Produtos" },
    { to: "/departamentos", icon: <DeptosIcon />, label: "Deptos" },
  ];

  return (
    <nav className="d-lg-none fixed-bottom bg-white border-top shadow-lg" aria-label="Navegacao inferior">
      <div className="container-fluid">
        <div className="row g-0">
          {items.map((item) => (
            <div key={item.to} className="col">
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `d-flex flex-column align-items-center justify-content-center text-decoration-none py-2 ${
                    isActive ? "text-primary" : "text-body-secondary"
                  }`
                }
                style={{ minHeight: "60px" }}
              >
                {({ isActive }) => (
                  <>
                    <span style={{ display: "inline-flex", alignItems: "center" }}>{item.icon}</span>
                    <span className="small mt-1" style={{ fontSize: "0.7rem" }}>{item.label}</span>
                    {isActive && <span className="position-absolute top-0 w-25 bg-primary" style={{ height: "3px" }}></span>}
                  </>
                )}
              </NavLink>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
