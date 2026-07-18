type NavbarProps = {
  titulo: string;
};

function Navbar({ titulo }: NavbarProps) {
  return (
    <>
      <div className="container m-3">
        <nav>
          <h2>{titulo}</h2>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
