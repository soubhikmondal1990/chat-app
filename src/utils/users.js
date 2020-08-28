const users = [];

const addUser = ({id, name, room}) => {
   const username = name.trim().toLowerCase();
   const roomname = room.trim().toLowerCase();

   if(!username || !roomname) {
       return {
           error: 'Data input error'
       }
   }

   const existingUser = users.find(user => user.name === username && user.room === roomname)

   if (existingUser) {
       return {
           error: 'existing error'
       }
   }

   const user = {id, name, room};
   //console.log(user)
   users.push(user);
   return {user}
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
      return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.filter(user => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
