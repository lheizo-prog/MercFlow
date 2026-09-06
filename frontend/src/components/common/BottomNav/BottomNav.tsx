import { NavLink } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

function BottomNav() {
  const { isAdmin } = useAuth();

  const items = [
    { to: "/", icon: "\uD83D\uDCCA", label: "In\u00EDcio" },
    { to: "/lancamentos", icon: "\uD83D\uDCDD", label: "Lan\u00E7ar" },
    { to: "/produtos_mercearia", icon: "\uD83D\uDED2", label: "Produtos" },
    ...(isAdmin
      ? [{ to: "/departamentos", icon: "\uD83C\uDFE2", label: "Deptos" }]
      : [{ to: "/departamentos", icon: "\uD83C\uDFE2", label: "Deptos" }]),
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
                    <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{item.icon}</span>
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
