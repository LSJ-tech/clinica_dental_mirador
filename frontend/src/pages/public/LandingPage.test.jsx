import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  it("renderiza los 9 servicios sin repetir", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    const items = document.querySelectorAll("#services-1354 .cs-item");
    expect(items.length).toBe(9);
  });

  it("el boton principal del hero apunta a /reservar", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    // "Reservar hora" tambien aparece en el link del nav (PublicNav), por
    // eso se busca especificamente el del hero.
    const boton = document.querySelector(".cs-hero-content .cs-link");
    expect(boton).toHaveTextContent("Reservar hora");
    expect(boton).toHaveAttribute("href", "/reservar");
  });
});
