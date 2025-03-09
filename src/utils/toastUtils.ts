import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultOptions = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light" as const,
};

// Success Toast
export const showSuccessToast = (message: string) => {
  toast.success(message, defaultOptions);
};

// Error Toast
export const showErrorToast = (message: string) => {
  toast.error(message, defaultOptions);
};

// Info Toast
export const showInfoToast = (message: string) => {
  toast.info(message, defaultOptions);
};

// Warning Toast
export const showWarningToast = (message: string) => {
  toast.warn(message, defaultOptions);
};
