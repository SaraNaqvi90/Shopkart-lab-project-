// Loads Razorpay's checkout script on demand and tells us whether it worked.
// Resolves true  -> window.Razorpay is ready to use
// Resolves false -> the script could not be loaded (offline, blocked, ...)
export function loadRazorpay() {
  return new Promise((resolve) => {
    // Already loaded earlier (for example on a previous attempt)? Reuse it.
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
