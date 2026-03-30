import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signInSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

interface SignInPhoneStepProps {
  loading: boolean;
  onSubmit: (data: SignInFormData) => void;
  inputStyle: React.CSSProperties;
  buttonStyle: React.CSSProperties;
}

export function SignInPhoneStep({ loading, onSubmit, inputStyle, buttonStyle }: SignInPhoneStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="tel"
        placeholder="Phone Number*"
        autoComplete="off"
        style={inputStyle}
        {...register("phone")}
      />
      {errors.phone && <div style={errorStyle}>{errors.phone.message}</div>}

      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "..." : "Next"}
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
