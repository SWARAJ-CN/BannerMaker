import commonAPI from "./commonApi";

// Core User Operations
export const AddUser = (reqData) => {
  return commonAPI('post', `/users`, reqData);
};

export const getUser = (id) => {
  return commonAPI('get', `/users/${id}`, "");
};

// --- New Authentication Pipeline ---

/**
 * Registers a new unique user configuration profile
 * @param {Object} userData - Contains username, email, and password
 */
export const registerUser = (userData) => {
  // Destructure to sanitize and remove unnecessary props like confirmPassword
  const { username, email, password } = userData;
  return commonAPI('post', '/users', { username, email, password });
};

/**
 * Fetches all user profiles to match email and password parameters
 * (Standard approach for simple mock backends like json-server)
 */
export const validateUser = () => {
  return commonAPI('get', '/users', "");
};