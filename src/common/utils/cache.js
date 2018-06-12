import storage from 'good-storage'

const TokenUser = '__User-Info__'

export function getUserInfo() {
  return storage.session.get(TokenUser, {})
}

export function setUserInfo(user) {
  return storage.session.set(TokenUser, user)
}

export function removeUserInfo() {
  return storage.session.remove(TokenUser, {})
}
