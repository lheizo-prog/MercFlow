type SidebarProps = {
  usuario: string;
};

function Sidebar({ usuario }: SidebarProps) {
  return (
    <>
      <h4>Usuário: {usuario}</h4>
      <aside>
        <ul>
          <li>Dashboard</li>
          <li>Produtos</li>
          <li>Setores</li>
          <li>Transferências</li>
          <li>Histórico</li>
        </ul>
      </aside>
    </>
  );
}

export default Sidebar;
