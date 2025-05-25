import { toast } from "sonner"; // Or any alternative library

export const successToast = (message) => {
  toast.success(message, {
    position: "top-center",
    duration: 3000,
  });
};

export const errorToast = (message) => {
  toast.error(message, {
    position: "top-center",
    duration: 3000,
  });
};
