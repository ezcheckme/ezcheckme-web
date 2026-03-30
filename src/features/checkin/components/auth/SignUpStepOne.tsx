import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signUpSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email address"),
  attendeeid: z.string().min(1, "ID is required"),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpStepOneProps {
  loading: boolean;
  onSubmit: (data: SignUpFormData) => void;
  inputStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
}

export function SignUpStepOne({ loading, onSubmit, inputStyle, buttonStyle }: SignUpStepOneProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="First Name*"
        autoComplete="off"
        style={inputStyle}
        {...register("firstName")}
      />
      {errors.firstName && <div style={errorStyle}>{errors.firstName.message}</div>}

      <input
        type="text"
        placeholder="Last Name*"
        autoComplete="off"
        style={inputStyle}
        {...register("lastName")}
      />
      {errors.lastName && <div style={errorStyle}>{errors.lastName.message}</div>}

      <input
        type="email"
        placeholder="Email address*"
        autoComplete="off"
        style={inputStyle}
        {...register("email")}
      />
      {errors.email && <div style={errorStyle}>{errors.email.message}</div>}

      <input
        type="tel"
        placeholder="ID*"
        autoComplete="off"
        style={inputStyle}
        {...register("attendeeid")}
      />
      {errors.attendeeid && <div style={errorStyle}>{errors.attendeeid.message}</div>}

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "..." : "Sign up"}
      </button>
    </form>
  );
}

const errorStyle: React.CSSProperties = {
  color: "#dd0000",
  fontSize: 12,
  marginTop: 2,
  marginBottom: 4,
};
