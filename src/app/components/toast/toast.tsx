import { toast } from "react-toastify";

export const SuccessToast = (message: string) => {
  const theme = localStorage.getItem("theme");
  return toast.success(message, {
    autoClose: 3333,
    theme: theme ? theme : "light",
  });
};
export const FailedToast = (message: string) => {
  const theme = localStorage.getItem("theme");
  return toast.error(message, {
    autoClose: 3333,
    theme: theme ? theme : "light",
  });
};
export const WarningToast = (message: string) => {
  const theme = localStorage.getItem("theme");
  return toast.warning(message, {
    autoClose: 3333,
    theme: theme ? theme : "light",
  });
};
