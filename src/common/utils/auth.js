import storage from 'good-storage'

const TokenKey = '__User-Token__'
const username = '__User-name__'
const password = '__Pass-word__'
const remember = '__Remember__'

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
  return storage.get(username)
}
export function setUsername(arg) {
  return storage.set(username, arg)
}
export function removeUsername() {
  return storage.remove(username)
}

export function getPassword() {
  return storage.get(password)
}
export function setPassword(arg) {
  return storage.set(password, arg)
}
export function removePassword() {
  return storage.remove(password)
}

export function getRemember() {
  return storage.get(remember)
}
export function setRemember(arg) {
  return storage.set(remember, arg)
}
export function removeRemember() {
  return storage.remove(remember)
}
