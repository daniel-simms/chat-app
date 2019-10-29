const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// Autoscroll
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;
  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  // Visible Height
  const visibleHeight = $messages.offsetHeight;
  // Height of messages container
  const containerHeight = $messages.scrollHeight;
  // How far have i scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Listen for messages
socket.on('message', message => {
  // Print message
  console.log(message);
  // Render message
  const html = Mustache.render(messageTemplate, {
    username: message.username || 'Admin',
    message: message.text,
    createdAt: moment(message.createdAt).format('H:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

// Listen for location
socket.on('locationMessage', ({ url, createdAt }) => {
  // Print location
  console.log(url);
  // Render location
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('H:mm')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

// Listen for room data
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  document.querySelector('#sidebar').innerHTML = html;
});

// Emit message from Form
$messageForm.addEventListener('submit', e => {
  e.preventDefault();

  // Disable form button
  $messageFormButton.setAttribute('disabled', 'disabled');

  // Print message
  const message = $messageFormInput.value;
  socket.emit('sendMessage', message, status => {
    // Print callback status
    console.log(status);
    // Enable button & clear input
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
  });
});

// Emit location
$sendLocationButton.addEventListener('click', e => {
  // Confirmation
  if (!confirm('Are you sure you want to send location?')) {
    return;
  }
  // Disable button
  $sendLocationButton.setAttribute('disabled', 'disabled');
  $sendLocationButton.innerText = 'Sending...';
  // Geolocation support
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }
  // Print message
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      status => {
        // Print callback status
        console.log(status);
        // Enable button
        $sendLocationButton.removeAttribute('disabled');
        $sendLocationButton.innerText = 'Send Location';
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

// Focus form input
(function() {
  $messageFormInput.focus();
})();
