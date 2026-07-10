type NavbarProps = {
  titulo: string;
};

function Navbar({ titulo }: NavbarProps) {
  return (
    <nav>
      <h2>{titulo}</h2>
    </nav>
  );
}

export default Navbar;
