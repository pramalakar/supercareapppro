angular.module('starter.services', [])


.service('ModalService', function($ionicModal, $rootScope, $q, $controller) {
 return {
            show: show
        }

        function show(templeteUrl, controller, parameters) {
            // Grab the injector and create a new scope
            var deferred = $q.defer(),
                ctrlInstance,
                modalScope = $rootScope.$new(),
                thisScopeId = modalScope.$id;

            $ionicModal.fromTemplateUrl(templeteUrl, {
                scope: modalScope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                modalScope.modal = modal;

                modalScope.open = function () {
                    modalScope.modal.show();
                };
                modalScope.close = function (result) {
                    deferred.resolve(result);
                    modalScope.modal.hide();
                };
                modalScope.$on('modal.hidden', function (thisModal) {
                    if (thisModal.currentScope) {
                        var modalScopeId = thisModal.currentScope.$id;
                        if (thisScopeId === modalScopeId) {
                            deferred.resolve(null);
                            _cleanup(thisModal.currentScope);
                        }
                    }
                });

                // Invoke the controller
                var locals = { '$scope': modalScope, 'parameters': parameters };
                var ctrlEval = _evalController(controller);
                ctrlInstance = $controller(controller, locals);
                if (ctrlEval.isControllerAs) {
                    ctrlInstance.open = modalScope.open;
                    ctrlInstance.close = modalScope.close;
                }

                modalScope.modal.show();

            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        function _cleanup(scope) {
            scope.$destroy();
            if (scope.modal) {
                scope.modal.remove();
            }
        }

        function _evalController(ctrlName) {
            var result = {
                isControllerAs: false,
                controllerName: '',
                propName: ''
            };
            var fragments = (ctrlName || '').trim().split(/\s+/);
            result.isControllerAs = fragments.length === 3 && (fragments[1] || '').toLowerCase() === 'as';
            if (result.isControllerAs) {
                result.controllerName = fragments[0];
                result.propName = fragments[2];
            } else {
                result.controllerName = ctrlName;
            }

            return result;
        }

})
.factory('AuthenticationService', 
    ['$rootScope', '$q', '$http', 'FIREBASE_URL', '$cordovaFacebook', '$firebaseAuth',
    function ($rootScope, $q, $http, FIREBASE_URL, $cordovaFacebook, $firebaseAuth) {
      var ref = new Firebase(FIREBASE_URL);
      var myObject = {
        login : function(credentials){debugger;
          return $q(function(resolve, reject){
            // if(credentials.username == 'admin' && credentials.password == 'test'){
            //     $rootScope.currentUser = {
            //         'username' : 'admin',
            //         'password' : 'test',
            //         'role' : 'admin'
            //     }
            //     resolve("success");
            // }else{
            //     reject('Login Failed.');
            // }
            ref.authWithPassword({
              "email": credentials.username,
              "password": credentials.password
              }, function(error, authData){debugger;
                if(error){
                  console.log("Login Failed");
                reject('Login Failed.');
              } else {debugger;
                console.log("Login success");
                resolve(authData);
              }
            });
          });//$q 
        },//login

        loginGoogle : function(){
          return $q(function(resolve, reject){
            
            ref.authWithOAuthPopup("google", function(error, authData) {
              if (error) {
                reject('Login Failed.');
              } else {
                resolve('Login success.');
              }
            });
          });//$q
        },//loginGoogle

        loginFacebook : function(){
          return $q(function(resolve, reject){
            if(ionic.Platform.isWebView()){
              $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
                console.log(success);           
                ref.authWithOAuthToken("facebook", success.authResponse.accessToken, function(error, authData) {
                  if (error) {
                    reject('Login Failed.');
                  } else {
                    resolve('Login success.');
                  }
                });
           
              }, function(error){
                reject('Login Failed.');
              });        
           
            }
            else {
           
              ref.authWithOAuthPopup("facebook", function(error, authData) {
                if (error) {
                  reject('Login Failed.');
                } else {
                  resolve('Login success.');
                }
              });
            }
          });//$q
        },//loginFacebook

        // register : function(credentials){debugger;
        //   return $q(function(resolve, reject){
        //     ref.createUser({
        //       email: credentials.email,
        //       password: credentials.password
        //     }, function(error, userData) {
        //       if (error) {
        //         switch (error.code) {
        //           case "EMAIL_TAKEN":
        //             reject('The new user account cannot be created because the email is already in use.');
        //             break;
        //           case "INVALID_EMAIL":
        //             reject('The specified email is not a valid email.');
        //             break;
        //           default:
        //             reject('Error creating user:', error);
        //         }
        //       } else {
        //         resolve(userData);
        //       }
        //     });
        //   });//$q
        // },//register

        logout : function(){
          var ref = new Firebase(FIREBASE_URL);
          return ref.unauth();
        },//logout

        loggedIn : function ()
        {
            if ($rootScope["currentUser"])
            {
                return true;
            }
            else
            {
                return false;
            }
        },//loggedIn

        isAuthorized : function(requiredRoles) {debugger;
        if (!angular.isArray(requiredRoles)) {
            requiredRoles = [requiredRoles];
        }
            return (myObject.loggedIn() && requiredRoles.indexOf($rootScope.currentUser) !== -1);
        }//isAuthorized

      }//myObject

      return myObject;
    }])

.factory('Rooms', function (FIREBASE_URL, $q) {

  function roomByRoomCode(searchInput){
    return $q(function(resolve, reject){
      var result = {};
      var ref = new Firebase(FIREBASE_URL + '/rooms');
      ref.on("value", function(snapshot) {debugger;
        // console.log(snapshot.val());
        var rooms = snapshot.val();
        snapshot.forEach(function(childSnapshot) {debugger;
          var childData = childSnapshot.val();
            if(childData !== null && childData.code.trim().toLowerCase() == (searchInput == null ? '' : searchInput.trim().toLowerCase())){
              result = childData;
              resolve(result);
            }
        });
        reject("Room Code not found");
      });
      
    });
  }

    

    // var all = [{
    //     "code":"15490M",
    //     "type":"15490M",
    //     "location":"I",
    //     "address":"2660"
    // },
    // {
    //     "code":"15491P",
    //     "type":"15491P",
    //     "location":"P",
    //     "address":"266P"
    // }];

    return {
        // getAll: function () {
        //     return all;
        // },
        roomByRoomCode: roomByRoomCode
    };
})

.factory('Facilities', function (FIREBASE_URL, FileService, $q) {

    var facilities = [];
    var ref = new Firebase(FIREBASE_URL + '/facilities');
    var facilities = null;
    ref.on('value', function(snapshot) {
      facilities = snapshot.val();
    });

    function getAll(){
      return facilities;
    };

    function addFacility(newFacility, img){debugger;
      return $q(function(resolve, reject){
        var newFacilityKey = ref.push().key(); // Add empty child and get its key

        var date = Firebase.ServerValue.TIMESTAMP;

        var update = {};
        update[newFacilityKey] = {
          "id": newFacilityKey,
          "date": date,
          "name": newFacility,
          "image": img
        };

        // After the .update() method is executed, it will trigger the .on() method.
        ref.update(update);
        ref.on('value', function(snapshot) {
          // message update successful
          resolve('Success Adding Facility');
        });
        // ref.push({
        //   "id": newFacilityKey,
        //   "date": date,
        //   "name": newFacility,
        //   "image": img
        // });
      })
    };

    function deleteFacility(id){debugger;
      return $q(function(resolve, reject){
        ref.child(id).remove(function(error){
          if(!error){
            // delete successful
            resolve('Delete successful');
          }else{
            reject('Delete Unsuccessful');
          }
        });
      })
    };

    // function facilityById(facilityId) {
    //     var selectedFacility = null;
    //     angular.forEach(facilities, function (facility) {debugger;
    //         if (facility.id.trim() == facilityId.trim()) {
    //             selectedFacility = facility;
    //         }
    //     });
    //     return selectedFacility;
    // };

    return {
        getAll: getAll,
        addFacility: addFacility,
        deleteFacility: deleteFacility
        // facilityById: facilityById
    };
})

.factory('Draft', function(){
  var POST_STORAGE_KEY = 'room';
 
  function getDraft() {debugger;
    var room = window.localStorage.getItem(POST_STORAGE_KEY);
    if (room) {
      return JSON.parse(room);
    } 
  };

  function addDraft(data){debugger;
    room = {
      "code": data.code,
      "type": data.type,
      "location": data.location,
      "address": data.address,
      "facility": data.facility,
      "component": data.component,
      "image": data.image,
      "checked": data.checked
    };
    window.localStorage.setItem(POST_STORAGE_KEY, angular.toJson(room));
  };

  return{
    addDraft: addDraft,
    getDraft: getDraft
  }
})

// .factory('FileService', function() {
//   var images;
//   var IMAGE_STORAGE_KEY = 'images';
 
//   function getImages() {
//     var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
//     if (img) {
//       images = JSON.parse(img);
//     } else {
//       images = [];
//     }
//     return images;
//   };
 
//   function addImage(img) {
//     images.push(img);
//     window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
//   };
 
//   return {
//     storeImage: addImage,
//     images: getImages
//   }
// })

.factory('DateTime', function(DAY_LIMIT){
  var now = new Date();
  function daysAgo(date){
    return Math.ceil(((now-date) / (1000 * 3600 * 24)) > DAY_LIMIT.days);
  };

  return {
    daysAgo: daysAgo
  }
})

// .factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
//   function makeid() {
//     var text = '';
//     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
//     for (var i = 0; i < 5; i++) {
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
//   };
 
//   function optionsForType(type) {
//     var source;
//     switch (type) {
//       case 0:
//         source = Camera.PictureSourceType.CAMERA;
//         break;
//       case 1:
//         source = Camera.PictureSourceType.PHOTOLIBRARY;
//         break;
//     }
//     return {
//       destinationType: Camera.DestinationType.FILE_URI,
//       sourceType: source,
//       allowEdit: false,
//       encodingType: Camera.EncodingType.JPEG,
//       popoverOptions: CameraPopoverOptions,
//       saveToPhotoAlbum: false
//     };
//   }
 
//   function saveMedia(type) {
//     return $q(function(resolve, reject) {
//       var options = optionsForType(type);
 
//       $cordovaCamera.getPicture(options).then(function(imageUrl) {
//         var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);

//         //======================
//         alert('name: '+ name);
//         name = name.split('?')[0];
//         alert('name: '+ name);


//         var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
//         alert('namePath: '+ namePath);
//         var newName = makeid() + name;
//         alert('newName: '+ newName);


//         $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, newName)
//           .then(function(info) {
//             alert("cordovafile");
//             alert("info: " + info);
//             FileService.storeImage(newName);
//             resolve();
//           }, function(e) {
//             reject();
//           });
//       });
//     })
//   }
//   return {
//     handleMediaDialog: saveMedia
//   }
// });

.factory('FileService', function() {
  var images = [];
  var IMAGE_STORAGE_KEY = 'images';
 
  function getImages() {
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };
 
  function addImage(imgName, imgData) {
    images.push({
      "imgName": imgName,
      "imgData": imgData
    });
    window.localStorage.setItem(IMAGE_STORAGE_KEY, angular.toJson(images));
  };

  function removeImageFromStorage(imgName, imgData) {
       window.localStorage.removeItem(IMAGE_STORAGE_KEY);
  };
 
  return {
    storeImage: addImage,
    images: getImages,
    removeImages: removeImageFromStorage
  }
})
.factory('ImageService', function($cordovaCamera, FileService, $q) {
  // , $cordovaFile,$cordovaFileTransfer
 
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
 
  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      // quality: 100,
      // targetWidth: 100,
      // targetHeight: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: source,// 0:Photo Library, 1=Camera, 2=Saved Photo Album
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
 
  function saveMedia(type) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
          
        // FileService.storeImage(imageUrl);

        // FileService.storeImage('data:image/jpeg;base64,' + imageUrl);
        // $rootScope.imageurl="data:image/jpeg;base64," + imageUrl;
        // var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        // alert("======name:======= "+name);
        // var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        // alert("=======namePath:======="+namePath);
        debugger;
        var imgName = makeid();
        // alert("========newName:======="+newName);
        FileService.storeImage(imgName, imageUrl);
        // $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
        //   .then(function(info) {
        //     alert('===== copyFile SUCCESS =====');
        //     FileService.storeImage(newName);
        //     resolve();
        //   }, function(e) {
        //     alert('==== copyFile ERROR====');
        //     reject();
        //   });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
  }
})
.service('AdsService', function() {
  

  })
;