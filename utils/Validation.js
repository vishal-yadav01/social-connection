const validator = require("validator");

exports.signupValidation = (req) => {
  const { firstName, lastName, email, password, otp, confirmPassword } =
    req.body;

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required.");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email address is required.");
  }

  if (!password) {
    throw new Error(
      "A strong password is required. It should include at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
    );
  }

  if (!otp) {
    throw new Error("OTP is required.");
  }
};

exports.loginValidation = (req) => {
  const { password, email } = req.body;
  if (!password) {
    throw new Error("Password Missing");
  }
  if (!email || !validator.isEmail(email)) {
    throw new Error("Email not valid");
  }
};

exports.profileEditValidation = (req) => {
  if (!req)
    throw new Error("request object missing in profile edit validation");
     
};
