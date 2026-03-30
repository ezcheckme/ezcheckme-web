import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignUpStepOne } from "../SignUpStepOne";

describe("SignUpStepOne", () => {
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
    render(<SignUpStepOne {...defaultProps} />);
    expect(screen.getByPlaceholderText("First Name*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address*")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ID*")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields on submit", async () => {
    render(<SignUpStepOne {...defaultProps} />);
    const user = userEvent.setup();
    const submitButton = screen.getByRole("button", { name: "Sign up" });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("First Name is required")).toBeInTheDocument();
      expect(screen.getByText("Last Name is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(screen.getByText("ID is required")).toBeInTheDocument();
    });

    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with valid data", async () => {
    render(<SignUpStepOne {...defaultProps} />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText("First Name*"), "John");
    await user.type(screen.getByPlaceholderText("Last Name*"), "Doe");
    await user.type(screen.getByPlaceholderText("Email address*"), "john.doe@example.com");
    await user.type(screen.getByPlaceholderText("ID*"), "12345");

    const submitButton = screen.getByRole("button", { name: "Sign up" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        attendeeid: "12345",
      }, expect.anything());
    });
  });
});
