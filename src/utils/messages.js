const generateMessage = (text, username) => {
  return {
    username,
    text,
    createdAt: new Date().getTime()
  };
};

const generateLocation = (url, username) => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocation
};
