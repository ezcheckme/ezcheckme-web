import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VerificationCodeStep } from "../VerificationCodeStep";

describe("VerificationCodeStep", () => {
  const defaultProps = {
    loading: false,
    onSubmit: vi.fn(),
    onCodeChange: vi.fn(),
    onCancel: vi.fn(),
    buttonStyle: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<VerificationCodeStep {...defaultProps} />);
    expect(screen.getByPlaceholderText("Verification code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify/i })).toBeInTheDocument();
  });

  it("disables the button when loading", () => {
    render(<VerificationCodeStep {...defaultProps} loading={true} />);
    const verifyButton = screen.getByRole("button", { name: "..." });
    expect(verifyButton).toBeDisabled();
  });

  it("calls onCodeChange when input value changes", async () => {
    render(<VerificationCodeStep {...defaultProps} />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("Verification code");

    await user.type(input, "123456");
    expect(defaultProps.onCodeChange).toHaveBeenCalledWith("123456");
  });

  it("calls onSubmit when form is submitted with non-empty code", async () => {
    render(<VerificationCodeStep {...defaultProps} />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText("Verification code");
    const submitButton = screen.getByRole("button", { name: /verify/i });

    await user.type(input, "123456");
    await user.click(submitButton);

    expect(defaultProps.onSubmit).toHaveBeenCalledWith("123456");
  });

  it("does not call onSubmit when form is submitted with empty code", async () => {
    render(<VerificationCodeStep {...defaultProps} />);
    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: /verify/i });

    await user.click(submitButton);

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
