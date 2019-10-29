const users = [];

// addUser
const addUser = ({ id, username, room }) => {
  // Clean data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate data
  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    };
  }

  // Check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use!'
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// addUser({
//   id: 22,
//   username: 'Daniel',
//   room: '123'
// });

// removeUser
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// getUser
const getUser = id => {
  return users.find(user => user.id === id);
};
// const user = getUser(22);
// console.log(user);

// getUsersInRoom
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};
// const usersInRooms = getUsersInRoom('123');
// console.log(usersInRooms);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
