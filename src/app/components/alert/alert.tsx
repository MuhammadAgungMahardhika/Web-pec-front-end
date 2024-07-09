import Swal from "sweetalert2";

export const SuccessAlert = (message: string) => {
  return Swal.fire({
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 1500,
  });
};

export const FailedAlert = (message: string) => {
  return Swal.fire({
    position: "top-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 1500,
  });
};

export const WarningAlert = (message: string) => {
  return Swal.fire({
    position: "top-end",
    icon: "warning",
    title: message,
    showConfirmButton: false,
    timer: 1500,
  });
};
