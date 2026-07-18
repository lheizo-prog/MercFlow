import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <>
      <div className="container m-3">
        <div>
          <Link to="/">Dashboard</Link>
        </div>
        <div>
          <Link to="/produtos">Produtos</Link>
        </div>
        <div>
          <Link to="/setores">Setores</Link>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
