import storage from 'good-storage'

const TokenKey = '__User-Token__'
const Username = '__User-Name__'
const Password = '__Pass-Word__'

export function getToken() {
  return storage.session.get(TokenKey)
}

export function setToken(token) {
  return storage.session.set(TokenKey, token)
}

export function removeToken() {
  return storage.session.remove(TokenKey)
}

export function getUsername() {
  return storage.session.get(Username)
}

export function setUsername(val) {
  return storage.session.set(Username, val)
}

export function getPassword() {
  return storage.session.get(Password)
}

export function setPassword(val) {
  return storage.session.set(Password, val)
}
