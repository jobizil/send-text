const numberInput = document.getElementById('number'),
  messageInput =
    (document.getElementById('msg'),
    (button = document.getElementById('button'))),
  response = document.querySelector('.response')

button.addEventListener('click', send, false)

const socket = io()
socket.on('smsStatus', function (data) {
  if (data.error) {
    response.innerHTML = '<h5>' + data.error + '</h5>'
  } else {
    response.innerHTML = '<h5>Text message sent to ' + data.number + '</h5>'
  }
})

function send() {
  const number = numberInput.value.replace(/\D/g, '')
  const text = messageInput.value

  fetch('/', {
    method: 'post',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ number: number, text: text }),
  })
    .then(res => response)
    .catch(error => console.log(error))
}
