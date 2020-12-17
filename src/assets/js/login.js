function onSubmit(evt) {
  evt.preventDefault();

  const username = document.querySelector('#username');
  const password = document.querySelector('#password');

  if (!isValid(username, password)) {
    return;
  }

  const payload = {
    username: username.value.trim(),
    password: password.value.trim()
  };

  authenticate(payload)
    .then(data => {
      if (!data.success) {
        alert('el usuario y/o contraseña son inválidos');
        return;
      }

      window.location.assign('/panel');
    });
}

function isValid(username, password) {
  if (username.value.trim() === '') {
    alert('ingrese el nombre del usuario');
    return false;
  } else if (password.value.trim() === '') {
    alert('ingrese la clave del usuario');
    return false;
  }

  return true;
}

function authenticate(payload) {
  const options = {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return fetch('/api/auth', options)
    .then(response => response.json());
}

const form = document.querySelector('#form');
form.addEventListener('submit', onSubmit);
