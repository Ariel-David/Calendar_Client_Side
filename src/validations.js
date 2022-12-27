const validateEmail = (email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
    ? true
    : false;
};

const validatePassword = (password) => {
  return /^[0-9]{5,10}$/.test(password)
    ? true
    : false;
};

export { validateEmail, validatePassword };
