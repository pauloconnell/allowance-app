import { toast } from "react-hot-toast";

const unsafePattern = /[<>/"'&]/g;

export function sanitizeInput(value: string): string {
  if (unsafePattern.test(value)) {
    toast.error("That character is not allowed");
    return value.replace(unsafePattern, "");
  }
  return value;
}
