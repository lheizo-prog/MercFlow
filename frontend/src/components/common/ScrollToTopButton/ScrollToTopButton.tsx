import { useEffect, useState } from "react";

export function ScrollToTopButton() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisivel(true);
      } else {
        setVisivel(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  if (!visivel) return null;

  return (
    <button
      type="button"
      className="btn btn-primary rounded-circle shadow position-fixed d-flex align-items-center justify-content-center p-0"
      style={{
        bottom: "75px",
        right: "22px",
        width: "44px",
        height: "44px",
        zIndex: 1040,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 6px 18px rgba(37, 99, 235, 0.35)",
      }}
      onClick={scrollToTop}
      title="Voltar ao topo da página"
      aria-label="Voltar ao topo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"
        />
      </svg>
    </button>
  );
}

export default ScrollToTopButton;
