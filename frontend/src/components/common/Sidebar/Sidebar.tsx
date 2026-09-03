import { NavLink } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Collapse } from "bootstrap";

interface SidebarProps {
  aberto: boolean;
  onNavegar: () => void;
}

function Sidebar({ aberto, onNavegar }: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) {
      return;
    }

    const collapse = Collapse.getOrCreateInstance(sidebarRef.current, {
      toggle: false,
    });

    if (aberto) {
      collapse.show();
    } else {
      collapse.hide();
    }
  }, [aberto]);

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/usuarios", label: "Usuários" },
    { to: "/produtos_genericos", label: "Produtos Base" },
    { to: "/departamentos", label: "Departamentos" },
    { to: "/produtos_mercearia", label: "Produtos Mercearia" },
    { to: "/produtos_departamento", label: "Produtos Departamento" },
    { to: "/lancamentos", label: "Lançamentos" },
  ];

  return (
    <aside
      id="menu-principal"
      ref={sidebarRef}
      className="collapse d-lg-block col-lg-2 bg-dark p-3"
    >
      <div className="d-flex align-items-center gap-2 mb-4 text-white">
        <span className="badge text-bg-info rounded-pill">MF</span>
        <span className="fw-semibold">Navegação</span>
      </div>

      <nav className="nav nav-pills flex-column gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : "text-white"}`
            }
            onClick={onNavegar}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
