import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignInPhoneStep } from "../SignInPhoneStep";

describe("SignInPhoneStep", () => {
  const defaultProps = {
    loading: false,
    onSubmit: vi.fn(),
    inputStyle: {},
    buttonStyle: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<SignInPhoneStep {...defaultProps} />);
    expect(screen.getByPlaceholderText("Phone Number*")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("disables button and shows loading state when loading is true", () => {
    render(<SignInPhoneStep {...defaultProps} loading={true} />);
    const button = screen.getByRole("button", { name: "..." });
    expect(button).toBeDisabled();
  });

  it("calls onSubmit when form is submitted with a non-empty phone number", async () => {
    render(<SignInPhoneStep {...defaultProps} />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("Phone Number*");
    const button = screen.getByRole("button", { name: "Next" });

    await user.type(input, "1234567890");
    await user.click(button);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({ phone: "1234567890" }, expect.anything());
    });
  });

  it("shows validation error and does not call onSubmit if the form is submitted with empty phone", async () => {
    render(<SignInPhoneStep {...defaultProps} />);
    const user = userEvent.setup();
    const button = screen.getByRole("button", { name: "Next" });

    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Please enter a valid phone number")).toBeInTheDocument();
    });
    
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
