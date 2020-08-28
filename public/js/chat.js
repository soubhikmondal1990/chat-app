const socket = io();
// socket.on('onUpdateCount', (count) => {
//     console.log('count: ' + count);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     socket.emit('onCountIncrement');
// })

const messageRen = document.querySelector('#message-template').innerHTML;
const location1 = document.querySelector('#location-template').innerHTML;
const messageHold = document.querySelector('#messages');
const sideTemp = document.querySelector('#side-bar').innerHTML;

const {name, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.on('locationShare', (message) => {
    console.log(message);
    const html = Mustache.render(location1, {
        name: message.name,
        link: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messageHold.insertAdjacentHTML('beforeend', html)
    // const link = "<a target='_blank' href='" + text + "'> Shared location </a>"
    // messageHold.insertAdjacentHTML('beforeend', link)
})

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageRen, {
        name: message.name,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messageHold.insertAdjacentHTML('beforeend', html)
})

socket.on('onMessageReceived', (message) => {
    console.log(message)
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideTemp, {
        room,
        users
    });
    document.querySelector('#sideBar').insertAdjacentHTML('beforeend', html)
})

socket.emit('join', {name, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
})

document.querySelector('#text-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const message = document.getElementById('text').value;
    document.querySelector('.submit').setAttribute('disabled', 'disabled');
    socket.emit('onMessageSend', message, (error) => {
        document.querySelector('.submit').removeAttribute('disabled')
        if(error) {
            return console.log(error)
        }
        document.getElementById('text').value = '';
        document.getElementById('text').focus();
        console.log('Delivered!')
    })
})

document.querySelector("#location").addEventListener('click', () => {
    if(!navigator.geolocation) {
        alert('Geolocation not supported')
    }

    document.querySelector("#location").setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('shareLocation', {
          lat: position.coords.latitude,
          lon: position.coords.longitude
      }, () => {
          document.querySelector("#location").removeAttribute('disabled')
          console.log('Location shared')
      })
    })
})
