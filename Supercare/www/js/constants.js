angular.module('starter.Constants', [])

.constant('FIREBASE_URL', 'https://glaring-inferno-7219.firebaseio.com')

.constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized',
  authenticated: 'authenticated'
})

.constant('DAY_LIMIT', {
  days: 5
})

.constant('USER_ROLES', {
  admin: 'admin_role',
  public: 'public_role'
});