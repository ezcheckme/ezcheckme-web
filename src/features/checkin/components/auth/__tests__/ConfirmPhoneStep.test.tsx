import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmPhoneStep } from "../ConfirmPhoneStep";

describe("ConfirmPhoneStep", () => {
  const defaultProps = {
    loading: false,
    maskedNumber: "***-***-7890",
    onSubmit: vi.fn(),
    inputStyle: {},
    buttonStyle: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with masked number", () => {
    render(<ConfirmPhoneStep {...defaultProps} />);
    expect(screen.getByText("***-***-7890")).toBeInTheDocument();
  });

  it("calls onSubmit when form is submitted with non-empty input", async () => {
    render(<ConfirmPhoneStep {...defaultProps} />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("Enter your phone number");
    const confirmButton = screen.getByRole("button", { name: "Confirm" });

    await user.type(input, "1234567890");
    await user.click(confirmButton);
    expect(defaultProps.onSubmit).toHaveBeenCalledWith("1234567890");
  });

  it("disables buttons when loading is true", () => {
    render(<ConfirmPhoneStep {...defaultProps} loading={true} />);
    const confirmButton = screen.getByRole("button", { name: "..." });
    expect(confirmButton).toBeDisabled();
  });
});
