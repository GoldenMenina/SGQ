// src/lib/session.js

export const getSession = () => {
  const sessionData = localStorage.getItem('session');
  if (sessionData) {
    return JSON.parse(sessionData);
  }
  return null;
};