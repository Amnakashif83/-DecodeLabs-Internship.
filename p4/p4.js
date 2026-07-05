const form = document.getElementById("registerForm");
const formStatus = document.getElementById("formStatus");

// ------- Fields -------
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

// ------- Regex Inspectors (Stage 2: Process) -------
// Email: general-purpose syntax check (text@text.text)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password: must contain 1 uppercase, 1 lowercase, 1 digit,
// 1 special character, and be at least 8 characters long.
const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// ------- Helper: set / clear error on a field -------
// This is the "Accessibility Tether": it keeps aria-invalid,
// aria-describedby's text, and the visual style all in sync.
function setFieldError(input, message) {
  const errorEl = document.getElementById(`${input.id}-error`);
  if (message) {
    input.setAttribute("aria-invalid", "true");
    input.classList.remove("valid");
    errorEl.textContent = message;
  } else {
    input.setAttribute("aria-invalid", "false");
    input.classList.add("valid");
    errorEl.textContent = "";
  }
}

// ------- Individual field validators -------
function validateName() {
  const value = nameInput.value.trim();
  if (value === "") {
    setFieldError(nameInput, "Full name is required.");
    return false;
  }
  if (value.length < 3) {
    setFieldError(nameInput, "Name must be at least 3 characters long.");
    return false;
  }
  setFieldError(nameInput, "");
  return true;
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (value === "") {
    setFieldError(emailInput, "Email address is required.");
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldError(emailInput, "Please enter a valid email address (e.g. name@example.com).");
    return false;
  }
  setFieldError(emailInput, "");
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (value === "") {
    setFieldError(passwordInput, "Password is required.");
    return false;
  }
  if (!PASSWORD_REGEX.test(value)) {
    setFieldError(
      passwordInput,
      "Password needs 8+ characters, an uppercase & lowercase letter, a number, and a special character (#?!@$%^&*-)."
    );
    return false;
  }
  setFieldError(passwordInput, "");
  return true;
}

function validateConfirmPassword() {
  const value = confirmPasswordInput.value;
  if (value === "") {
    setFieldError(confirmPasswordInput, "Please confirm your password.");
    return false;
  }
  if (value !== passwordInput.value) {
    setFieldError(confirmPasswordInput, "Passwords do not match.");
    return false;
  }
  setFieldError(confirmPasswordInput, "");
  return true;
}

// ------- Live validation on blur (Phase 2 & 4: polite, not per keystroke) -------
// Validating on "blur" (when the user leaves the field) instead of on
// every keystroke keeps screen-reader announcements calm and useful.
nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);
confirmPasswordInput.addEventListener("blur", validateConfirmPassword);

// Re-check confirm-password live if the user edits password after
// already filling confirm password, so the mismatch clears promptly.
passwordInput.addEventListener("input", () => {
  if (confirmPasswordInput.value !== "") {
    validateConfirmPassword();
  }
});

// ------- Stage 2: The Gatekeeper (Form Submission) -------
form.addEventListener("submit", function (event) {
  // Step 1: stop the browser's default refresh (the "memory wipe")
  event.preventDefault();

  // Step 2: run every logic gate
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const isConfirmValid = validateConfirmPassword();

  const allValid = isNameValid && isEmailValid && isPasswordValid && isConfirmValid;

  // Step 3: The Communicator (Stage 3: Output)
  if (!allValid) {
    formStatus.textContent = "Please fix the highlighted errors above and try again.";
    formStatus.className = "form-status error";

    // Move focus to the first invalid field for keyboard/screen-reader users
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // All gates passed — package the payload (Stage 3: Payload Dispatch)
  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value, // in real apps: never log this; shown here for demo only
  };

  console.log("Validated JSON payload ready for dispatch:", JSON.stringify(payload));

  formStatus.textContent = "Account created successfully! Welcome aboard.";
  formStatus.className = "form-status success";

  form.reset();
  // Clear stale valid/invalid styling after reset
  [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach((input) => {
    input.setAttribute("aria-invalid", "false");
    input.classList.remove("valid");
  });
});