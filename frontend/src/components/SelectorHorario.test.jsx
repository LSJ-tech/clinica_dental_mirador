import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectorHorario from "./SelectorHorario";
import { disponibilidadApi } from "../api/resources";

vi.mock("../api/resources", () => ({
  disponibilidadApi: { get: vi.fn() },
}));

describe("SelectorHorario", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no muestra nada de disponibilidad si falta profesional o fecha", () => {
    render(<SelectorHorario profesional="" fecha="2026-02-01" value="" onChange={vi.fn()} />);
    expect(disponibilidadApi.get).not.toHaveBeenCalled();
    expect(screen.queryByText("Horario disponible ese día")).not.toBeInTheDocument();
  });

  it("consulta la disponibilidad cuando hay profesional y fecha, y muestra los slots", async () => {
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00", "09:30"] } });
    render(<SelectorHorario profesional="1" fecha="2026-02-01" value="" onChange={vi.fn()} />);
    expect(disponibilidadApi.get).toHaveBeenCalledWith({ profesional: "1", fecha: "2026-02-01" });
    expect(await screen.findByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("09:30")).toBeInTheDocument();
  });

  it("muestra un mensaje si no hay horas libres", async () => {
    disponibilidadApi.get.mockResolvedValue({ data: { slots: [] } });
    render(<SelectorHorario profesional="1" fecha="2026-02-01" value="" onChange={vi.fn()} />);
    expect(
      await screen.findByText("Sin horas libres configuradas ese día para este profesional.")
    ).toBeInTheDocument();
  });

  it("muestra un error si falla la consulta de disponibilidad", async () => {
    disponibilidadApi.get.mockRejectedValue(new Error("network"));
    render(<SelectorHorario profesional="1" fecha="2026-02-01" value="" onChange={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar la disponibilidad."
    );
  });

  it("clickear un slot llama a onChange con esa hora", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    disponibilidadApi.get.mockResolvedValue({ data: { slots: ["09:00"] } });
    render(<SelectorHorario profesional="1" fecha="2026-02-01" value="" onChange={onChange} />);
    await user.click(await screen.findByText("09:00"));
    expect(onChange).toHaveBeenCalledWith("09:00");
  });

  it("el campo de hora manual sigue disponible y llama a onChange con el valor", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SelectorHorario profesional="" fecha="" value="" onChange={onChange} />);
    await user.type(screen.getByLabelText("Hora"), "10:15");
    expect(onChange).toHaveBeenCalled();
  });
});
