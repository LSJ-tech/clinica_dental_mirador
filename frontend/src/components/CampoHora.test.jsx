import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CampoHora from "./CampoHora";

describe("CampoHora", () => {
  it("muestra el valor y notifica los cambios", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CampoHora value="09:00" onChange={onChange} />);
    const input = screen.getByLabelText("Hora");
    expect(input).toHaveValue("09:00");
    expect(input).toBeRequired();
    await user.clear(input);
    await user.type(input, "10:30");
    expect(onChange).toHaveBeenCalled();
  });
});
