import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <>
      <div>
        <Link to="/">Dashboard</Link>
      </div>
      <div>
        <Link to="/produtos">Produtos</Link>
      </div>
      <div>
        <Link to="/setores">Setores</Link>
      </div>
    </>
  );
}

export default Sidebar;
