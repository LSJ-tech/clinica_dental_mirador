import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CampoProfesional from "./CampoProfesional";

const PROFESIONALES = [
  { id: 1, nombre: "Dra. Soto" },
  { id: 2, nombre: "Dr. Diaz" },
];

describe("CampoProfesional", () => {
  it("lista las opciones y la opcion inicial de seleccionar", () => {
    render(<CampoProfesional value="" onChange={vi.fn()} profesionales={PROFESIONALES} />);
    const select = screen.getByLabelText("Profesional");
    expect(select).toBeRequired();
    expect(screen.getByText("Seleccionar...")).toBeInTheDocument();
    expect(screen.getByText("Dra. Soto")).toBeInTheDocument();
    expect(screen.getByText("Dr. Diaz")).toBeInTheDocument();
  });

  it("notifica el cambio de seleccion", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CampoProfesional value="" onChange={onChange} profesionales={PROFESIONALES} />);
    await user.selectOptions(screen.getByLabelText("Profesional"), "2");
    expect(onChange).toHaveBeenCalled();
  });
});
