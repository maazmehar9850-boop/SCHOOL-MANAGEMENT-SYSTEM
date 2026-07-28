import toast from "react-hot-toast";

let authRedirectPending = false;

export function notifySuccess(message) {
  toast.dismiss();
  return toast.success(message);
}

export function notifyError(message) {
  toast.dismiss();
  return toast.error(message);
}

export function notifyInfo(message) {
  return toast(message, {
    icon: "⏳",
    duration: 5000,
  });
}

export function redirectToLogin(message, delay = 1200) {
  if (authRedirectPending) return;
  authRedirectPending = true;

  notifyError(message);

  window.setTimeout(() => {
    window.location.href = "/login";
  }, delay);
}

export function resetAuthRedirectState() {
  authRedirectPending = false;
}
