// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.Constants', 'ngCordova', 'angularMoment', 'ngStorage', 'firebase'])

.run(function($ionicPlatform, ModalService, $rootScope, $state, $location, AUTH_EVENTS, FIREBASE_URL, $ionicPopup, AuthenticationService) {

  $rootScope["currentUser"] = {};
  ModalService.show("templates/login.html","LoginModalCtrl");

  $rootScope.$on(AUTH_EVENTS.notAuthorized, function(event) {debugger;
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
   
  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthenticationService.logout();

    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });



  $rootScope.$on("$stateChangeError", console.log.bind(console));
  // debugging ui router

  // $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
  //   var ref = new Firebase(FIREBASE_URL);
  //   var authData = ref.getAuth();
  //   if (!authData) {
  //     if (!$rootScope.isLoginPage || $rootScope.isLoginPage === 'undefined') {debugger;
  //       event.preventDefault();
  //       ModalService.show("templates/login.html","LoginModalCtrl");
  //       $rootScope.isLoginPage = true;
  //       console.log("go to login page");
  //     }
  //     // $rootScope.userEmail = authData.auth.token.email;
  //   }else{
  //     $rootScope.isLoginPage = false;
  //   }
  // });
  // $rootScope.$on('$stateChangeStart', function (event, next, nextParams, fromState) {
  //   debugger;
  //     // console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
  //     if (!AuthenticationService.loggedIn()) {debugger;
  //       if (!$rootScope.isLoginPage || $rootScope.isLoginPage === 'undefined') {debugger;
  //         event.preventDefault();
  //         ModalService.show("templates/login.html","LoginModalCtrl");
  //         $rootScope.isLoginPage = true;
  //         console.log("go to login page");
  //       }else{
  //         $rootScope.isLoginPage = false;
  //       }
  //     }else{debugger;
  //         if ('data' in next && 'requiredRoles' in next.data) {debugger;
  //           var requiredRoles = next.data.requiredRoles;
  //           if (!AuthenticationService.isAuthorized(requiredRoles)) {debugger;
  //             event.preventDefault();

  //             // $state.go($state.current, {}, {reload: true});
  //             $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
  //           }else{
  //             $rootScope.$broadcast(AUTH_EVENTS.authenticated, "authData");
  //             $location.path('/setttings');
  //           }
  //         }
  //     }
  // });
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      console.log('$stateChangeError - fired when an error occurs during transition.');
      console.log(arguments);
  });
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
  });
  // $rootScope.$on('$viewContentLoading',function(event, viewConfig){
  //   // runs on individual scopes, so putting it in "run" doesn't work.
  //   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
  // });
  $rootScope.$on('$viewContentLoaded', function (event) {
      console.log('$viewContentLoaded - fired after dom rendered', event);
  });
  $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
      console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
      console.log(unfoundState, fromState, fromParams);
  });

  // $rootScope.$on("$cordovaNetwork:offline", function (event, result) {
  //     console.log("Device is now Offline!");
  // });

  // $rootScope.$on("$cordovaNetwork:online", function (event, result) {
  //     console.log("Device is Online!");
  // });


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
  .state('app.room', {
    url: '/room',
    views: {
      'menuContent': {
        templateUrl: 'templates/room.html',
        controller: 'RoomCtrl'
      }
    },
    data : {
        requiredRoles: ["basic"]
    }
  })
  .state('app.room-detail', {
    url: '/room-detail',
    views: {
      'menuContent': {
        templateUrl: 'templates/room-detail.html',
        controller: 'RoomDetailCtrl'
      }
    },
    data : {
        requiredRoles: ["basic"]
    }
  })
  .state('app.checklist', {
    url: '/checklist',
    views: {
      'menuContent': {
        templateUrl: 'templates/checklist.html',
        controller: 'ChecklistCtrl'
      }
    },
    data : {
        requiredRoles: ["admin"]
    }
  })
  .state('app.checkitem-detail', {
    url: '/checkitem-detail/:checkitem',
    views: {
      'menuContent': {
        templateUrl: 'templates/checkitem-detail.html',
        controller: 'CheckitemDetailCtrl'
      }
    },
    data : {
        requiredRoles: ["basic"]
    }
  })
  .state('app.facility', {
    url: '/facility',
    views: {
      'menuContent': {
        templateUrl: 'templates/facility.html',
        controller: 'FacilityCtrl'
      }
    },
    data : {
        requiredRoles: ["basic"]
    }
  })
  .state('app.component', {
    url: '/component/:selectedFacility',
    views: {
      'menuContent': {
        templateUrl: 'templates/component.html',
        controller: 'ComponentCtrl'
      }
    },
    data : {
        requiredRoles: ["basic"]
    }
  })
  .state('app.camera', {
    url: '/camera',
    views: {
      'menuContent': {
        templateUrl: 'templates/camera.html',
        controller: 'ImageCtrl'
      }
    },
    data : {
        requiredRoles: ["basic"]
    }
  })
  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    },
    data : {
        requiredRoles: ["admin","basic"]
    }
  })
  .state('app.addremove-facility', {
    url: '/addremove-facility',
    views: {
      'menuContent': {
        templateUrl: 'templates/addremove-facility.html',
        controller: 'AddremoveFacilityCtrl'
      }
    },
    data : {
        requiredRoles: ["admin"]
    }
  })
  .state('app.add-facility', {
    url: '/add-facility',
    views: {
      'menuContent': {
        templateUrl: 'templates/add-facility.html',
        controller: 'AddFacilityCtrl'
      }
    },
    data : {
        requiredRoles: ["admin"]
    }
  })
  .state('app.addremove-component', {
    url: '/addremove-component',
    views: {
      'menuContent': {
        templateUrl: 'templates/addremove-component.html',
        controller: 'AddremoveComponentCtrl'
      }
    },
    data : {
        requiredRoles: ["admin"]
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app');

});
