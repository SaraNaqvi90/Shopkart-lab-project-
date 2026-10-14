
const isBlank = (value) => !value || value.trim().length === 0;

export function validateShipping(form) {
  const errors = {};

  if (isBlank(form.fullName)) {
    errors.fullName = 'Enter your full name.';
  }

  if (isBlank(form.phone)) {
    errors.phone = 'Enter your phone number.';
  } else if (!/^\d{6,15}$/.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number (digits only).';
  }

  if (isBlank(form.addressLine1)) {
    errors.addressLine1 = 'Enter your address.';
  }

  if (isBlank(form.city)) {
    errors.city = 'Enter your city.';
  }

  if (isBlank(form.state)) {
    errors.state = 'Enter your state.';
  }

  if (isBlank(form.pincode)) {
    errors.pincode = 'Enter your pincode.';
  } else if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = 'Enter a valid 6-digit pincode.';
  }

  return errors;
}
