declare module "otp-input-react" {
  import * as React from "react";

  interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    OTPLength?: number;
    otpType?: "number" | "string" | "password";
    disabled?: boolean;
    autoFocus?: boolean;
    className?: string;
    inputClassName?: string;
    separator?: React.ReactNode;
  }

  const OTPInput: React.ComponentType<OTPInputProps>;
  export default OTPInput;
}
