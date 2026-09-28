import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PublicNav from "./PublicNav";

function renderNav() {
  return render(
    <MemoryRouter>
      <PublicNav />
    </MemoryRouter>
  );
}

describe("PublicNav", () => {
  it("el menu empieza cerrado y se abre al tocar el boton hamburguesa", async () => {
    const user = userEvent.setup();
    renderNav();
    const boton = screen.getByLabelText("Abrir menú");
    expect(boton).toHaveAttribute("aria-expanded", "false");
    await user.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
  });

  it("tocar un link del menu lo cierra", async () => {
    const user = userEvent.setup();
    renderNav();
    const boton = screen.getByLabelText("Abrir menú");
    await user.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByText("Nuestro equipo"));
    expect(boton).toHaveAttribute("aria-expanded", "false");
  });
});
