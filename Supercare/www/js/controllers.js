angular.module('starter.controllers', [])
.controller('AppCtrl', function($scope, $rootScope, $state, $location, $ionicModal, $ionicPopup, AUTH_EVENTS, $firebaseObject, FIREBASE_URL, AuthenticationService) {
  
  	// Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

	$rootScope.$on(AUTH_EVENTS.authenticated, function(e, authUser){
	    debugger;
	    var ref = new Firebase(FIREBASE_URL + '/users/' + authUser.uid);
	    var user = $firebaseObject(ref);

	    user.$loaded().then(function(){debugger;
	      $rootScope.currentUser = user;
	    });
	}); //$firebaseAuth:login



	$scope.logout = function(){
	    AuthenticationService.logout();
	    $rootScope.currentUser = '';
	    $state.go('app.login');    
	}//logout
})

.controller('LoginModalCtrl',
    ['$scope', '$rootScope', '$location', 'AUTH_EVENTS', 'AuthenticationService', '$ionicPopup', '$timeout', '$state', 'firebase', 'FIREBASE_URL', 'Facilities', '$ionicLoading',
    function ($scope, $rootScope, $location, AUTH_EVENTS, AuthenticationService, $ionicPopup, $timeout, $state, firebase, FIREBASE_URL, Facilities, $ionicLoading) {
	$scope.credentials = {
	    username: 'abc@gmail.com',
	    password: 'test'
	};
	$scope.login = function() {
		$ionicLoading.show({
             template: '<ion-spinner icon="android"></ion-spinner>'
         });
	    AuthenticationService.login($scope.credentials)
	      .then(function(authData){debugger;
	      	//success
	      	$ionicLoading.hide();
	      	$scope.modal.remove();
	        // $rootScope.$broadcast(AUTH_EVENTS.authenticated, authData);
	        $state.go('app.room');
	        // return authData;
	      }, function(error){
	        // Error
            var alertPopup = $ionicPopup.alert({
            title: "Login Error",
            template: "Incorrect username or password."
            });
	      });//Authentication
	};//login

	 
	$scope.loginFacebook = function(){
	    AuthenticationService.loginFacebook()
      	.then(function(user){
      		$scope.modal.remove();
	        $state.go('app.room');
      	}, function(error){
	        $scope.message = error.toString();
      	});//Authentication
	};//loginFacebook

	$scope.loginGoogle = function(){
	  
	    AuthenticationService.loginGoogle()
			.then(function(user){
				$scope.modal.remove();
				$state.go('app.room');
			}, function(error){
				$scope.message = error.toString();
			});//Authentication
	};//loginGoogle

}])

.controller('RoomCtrl', function($scope, $state, $window,Rooms, Draft, $cordovaBarcodeScanner, $ionicPopup) {
	debugger;

  	$scope.room = {
		"code": null,
		"type": null,
		"location": null,
		"address": null,
		"facility": null,
		"component": null,
		"image": null,
		"description": '',
		"checked": 'false'
    };

    $scope.scanBarcode = function() {
		console.log('scanBarcode function got called');
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			var data = JSON.parse(imageData.text);
			$scope.room.code = data.code;
			$scope.room.type = data.type;
			$scope.room.location = data.location;
			$scope.room.address = data.address;
			Draft.addDraft($scope.room);
			$state.go('app.room-detail');  
			// $scope.$apply();
			
		}, function(error) {
		  console.log("An error happened -> " + error);
		});
	};

    $scope.gotoRoomDetail = function(){
    	Rooms.roomByRoomCode($scope.room.code)
    	.then(function(result){debugger;
    		$scope.room.code = result.code;
    		$scope.room.type = result.type;
    		$scope.room.location = result.location;
    		$scope.room.address = result.address;
    		Draft.addDraft($scope.room);
    		$state.go('app.room-detail');  
    	}, function(error){
	        // Error
	        var alertPopup = $ionicPopup.alert({
	        title: "Not Found",
	        template: error
	        });
	    });//roomByRoomCode
    	  	
    };
})

.controller('RoomDetailCtrl', function($scope, $state, Draft) {
	$scope.room = Draft.getDraft();
	$scope.gotoFacility = function(){
		$state.go('app.facility');
	};

})

.controller('FacilityCtrl', function($scope, $state, Facilities, $state, Draft) {

	// $scope.$on('$ionicView.enter', function() {
      	$scope.facilities = Facilities.getAll();
      	$scope.room = Draft.getDraft();
    // });

    // $scope.$watch('$scope.facilities', function(newVal, oldVal){
    // 	$scope.facilities = newVal;
    // });
	
	
	$scope.gotoComponent = function(facility){
		$scope.room.facility = facility.name;
		Draft.addDraft($scope.room);
		$state.go('app.component', {selectedFacility: JSON.stringify(facility)});
	};

})

.controller('ComponentCtrl', function($scope, $state, $stateParams, Draft,          $rootScope, FIREBASE_URL) {
	$scope.components = JSON.parse($stateParams.selectedFacility).components;

	// $scope.$on('$ionicView.enter', function() {
 //      	console.log('Components $ionicView.enter');
      	
 //    });
 	$scope.room = Draft.getDraft();

    $scope.gotoCamera = function(component){debugger;
    	$scope.room.component = component.name;
    	// addChecklist();
    	Draft.addDraft($scope.room);
		$state.go('app.camera');
	};


	// automatic breaking rows in ng-repeat
	$scope.columnBreak = 3; //Max number of colunms
	$scope.startNewRow = function (index, count) {
	    return ((index) % count) === 0;
	};
})


.controller('ChecklistCtrl', function($scope, $state, $cordovaBarcodeScanner, FIREBASE_URL, $ionicListDelegate, DateTime) {
	
	$scope.checklist = [];
	$scope.filterBy = "checked";
	$scope.filterValue = '';
	$scope.roomCode = '';

	$scope.daysAgo = function(date){debugger;
		return DateTime.daysAgo(date);
	};
	
	var ref = new Firebase(FIREBASE_URL + '/checklist');

	ref.on("child_added", function(snapshot){debugger;
		$scope.checklist.push(snapshot.val());
	});

	$scope.scanBarcode = function() {debugger;
		$cordovaBarcodeScanner.scan().then(function(imageData) {
			var data = JSON.parse(imageData.text);
			$scope.roomCode = data.code;
			
			$scope.barcodeScanned = {};
			$scope.barcodeScanned[$scope.roomCode] = 'true';//to verify the room QRcode is scanned before updating as it is checked

		}, function(error) {
		  console.log("An error happened -> " + error);
		});
	};

	// Actions for Tab Buttons
	$scope.showAll = function(){
		$scope.filterValue = '';
		$scope.roomCode = '';
	};

	$scope.showCheckRequired = function(){
		$scope.filterValue = 'false';
		$scope.roomCode = '';
	};

	$scope.showCheckCompleted = function(){
		$scope.filterValue = 'true';
		$scope.roomCode = '';
	};
	// End Actions for Tab Buttons


	// Actions for Option Buttons (swipe)
	$scope.check = function(id, index){debugger;
		$scope.checklist[index].checked = 'true';

		ref.child(id).child('checked').set('true');
		$ionicListDelegate.closeOptionButtons();
	};

	$scope.uncheck = function(id, index){debugger;
		$scope.checklist[index].checked = 'false';

		ref.child(id).child('checked').set('false');
		$ionicListDelegate.closeOptionButtons();
	};


	$scope.delete = function(id, index){debugger;
		$scope.checklist.splice(index,1);
		ref.child(id).remove(function(error){
			if(!error){
				$ionicListDelegate.closeOptionButtons();// closes the swipe
			}
		});
	};
	// End Actions for Option Buttons (swipe)

	$scope.filterChecked = function(){debugger;
		// $scope.filterBy = 'checked'; 
		$scope.filterValue = 'true';
	}

	$scope.filterUnchecked = function(){debugger;
		// $scope.filterBy = 'checked'; 
		$scope.filterValue = 'false';
	};

	$scope.$watch('$scope.filterValue', function(newVal, oldVal){
		$scope.filterValue = newVal;
	});


	$scope.gotoCheckitemDetail = function(item){debugger;
		$state.go('app.checkitem-detail', {checkitem: JSON.stringify(item)});
	};

})

.controller('CheckitemDetailCtrl', function($scope, $stateParams, DateTime) {debugger;
	$scope.$on('$ionicView.enter', function() {
		$scope.room = JSON.parse($stateParams.checkitem);  

		$scope.daysAgo = function(date){debugger;
			return DateTime.daysAgo(date);
		};    	
    });
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('AddremoveFacilityCtrl', function($scope, FileService, Facilities, $ionicPopup, $ionicListDelegate, FIREBASE_URL) {
	$scope.facilities = [];
	$scope.$on('$ionicView.enter', function() {
      	$scope.facilities = Facilities.getAll();
    })

    $scope.delete = function(id, index){debugger;
    	var confirmPopup = $ionicPopup.confirm({
	     	title: 'Delete',
	     	template: 'Are you sure you want to delete this?'
	   	});

	   	confirmPopup.then(function(res) {
	     	if(res) {
	       		Facilities.deleteFacility(id)
		    	.then(function(data){
		    		debugger;
		    		$scope.facilities.splice(index, 1);
		    		var alertPopup = $ionicPopup.alert({
			            title: "Success",
			            template: "Successfully deleted facility."
		            });
		    	},function(error){
		    		// Error
		            var alertPopup = $ionicPopup.alert({
		            title: "Error",
		            template: "Error in deleting facility."
		            });
		    	});

	     	} else {
	      		// console.log('Deletion canceled !');
	     	}
	   	});
    	$ionicListDelegate.closeOptionButtons();
    }
})


.controller('AddFacilityCtrl', function($scope, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService, Facilities, FIREBASE_URL, $ionicPopup) {

	$scope.$on('$ionicView.leave', function() {
      	// clear the image from localStorage
      	FileService.removeImages();
    })

	$ionicPlatform.ready(function() {
	    $scope.images = FileService.images();
	    // $scope.$apply();
	})
	 
	$scope.addMedia = function() {
	    $scope.hideSheet = $ionicActionSheet.show({
	      buttons: [
	        { text: 'Take photo' },
	        { text: 'Photo from library' }
	      ],
	      titleText: 'Add images',
	      cancelText: 'Cancel',
	      buttonClicked: function(index) {
	        $scope.addImage(index);
	      }
	    });
	}
	 
	$scope.addImage = function(type) {
	    $scope.hideSheet();
	    ImageService.handleMediaDialog(type).then(function() {
	      $scope.$apply();
	    });
	}

	  // delete image
	   // Triggered on a button click, or some other target
	$scope.deleteImage = function(img) {
	   // Show the action sheet
	   var hideSheet = $ionicActionSheet.show({
	     buttons: [
	       { text: 'Delete' }
	     ],
	     titleText: 'Delete Image',
	     cancelText: 'Cancel',
	     cancel: function() {
	          // add cancel code..
	        },
	     buttonClicked: function(index) {
	      $scope.images.splice(img,1);
	      window.localStorage.setItem("images", images);
	      $scope.hideSheet();
	      $scope.$apply();
	     }
	   });
 	}

 	// Store to firebase
 	$scope.addFacility = function(newFacility){
 		var img = $scope.images[0].imgData;
 		Facilities.addFacility(newFacility, img)
 		.then(function(data){
 			if(data){
 				var alertPopup = $ionicPopup.alert({
	            title: "Success",
	            template: "Successfully added new facility."
	            });
 			}else{
 				var alertPopup = $ionicPopup.alert({
	            title: "Error",
	            template: "Error in adding new facility."
	            });
 			}
 		});
 	}
})
// .controller('ImageCtrl', function($scope, $cordovaCamera,  $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService, FIREBASE_URL, Draft, $q) {
// 	$scope.fileURL = [];
// 	$scope.$on('$ionicView.leave', function() {
//       	// clear the image from localStorage
//     })

// 	// $ionicPlatform.ready(function() {
// 	//     $scope.images = FileService.images();
// 	//     // $scope.$apply();
// 	// })
	 
// 	$scope.addMedia = function() {
// 	    $scope.hideSheet = $ionicActionSheet.show({
// 	      buttons: [
// 	        { text: 'Take photo' },
// 	        { text: 'Photo from library' }
// 	      ],
// 	      titleText: 'Add images',
// 	      cancelText: 'Cancel',
// 	      buttonClicked: function(index) {
// 	        $scope.addImage(index);
// 	      }
// 	    });
// 	}
	 
// 	$scope.addImage = function(type) {
// 	    $scope.hideSheet();
// 	    saveMedia(type).then(function() {
// 	      $scope.$apply();
// 	    });
// 	}

// 	function saveMedia(type) {
// 	    return $q(function(resolve, reject) {
// 	      var options = optionsForType(type); 
// 	      $cordovaCamera.getPicture(options).then(function(imageData) {
// 	        $scope.fileURL.push(imageData);
// 	      });
// 	    })
// 	}

// 	function optionsForType(type) {
// 	    var source;
// 	    switch (type) {
// 	      case 0:
// 	        source = Camera.PictureSourceType.CAMERA;
// 	        break;
// 	      case 1:
// 	        source = Camera.PictureSourceType.PHOTOLIBRARY;
// 	        break;
// 	    }
// 	    return {
// 	      quality: 90,
// 	      // targetWidth: 100,
// 	      // targetHeight: 100,
// 	      destinationType: Camera.DestinationType.DATA_URL,
// 	      sourceType: source,// 0:Photo Library, 1=Camera, 2=Saved Photo Album
// 	      allowEdit: false,
// 	      encodingType: Camera.EncodingType.JPEG,
// 	      popoverOptions: CameraPopoverOptions,
// 	      saveToPhotoAlbum: false
// 	    };
// 	  }

// 	  // delete image
// 	   // Triggered on a button click, or some other target
// 	$scope.deleteImage = function(img) {
// 	   // Show the action sheet
// 	   var hideSheet = $ionicActionSheet.show({
// 	     buttons: [
// 	       { text: 'Delete' }
// 	     ],
// 	     titleText: 'Delete Image',
// 	     cancelText: 'Cancel',
// 	     cancel: function() {
// 	          // add cancel code..
// 	        },
// 	     buttonClicked: function(index) {
// 	      $scope.fileURL.splice(index,1);
// 	      $scope.hideSheet();
// 	      $scope.$apply();
// 	     }
// 	   });
//  	}

// 	  $scope.openMailComposer = function() {

// 	    var bodyText = '<html><h2>Maintenance Reporting Detail</h2></html>';
// 	    var email = {
// 	        to: 'pramalakar.2010@gmail.com',
// 	        attachments: ['base64:attachment.jpg//' + $scope.fileURL[0]],
// 	        subject: 'Report Information',
// 	        body: bodyText,
// 	        isHtml: true
// 	      };

// 	    $cordovaEmailComposer.open(email).then(null, function() {
// 	     	//clear photoes
// 	    });
// 	  }



// // 	  //stores report to database
// // 	  $scope.addChecklist = function(){

// // 	  	Draft.addDraft($scope.room);

// // 		var ref = new Firebase(FIREBASE_URL + '/checklist');
// // 		$scope.room.date = Firebase.ServerValue.TIMESTAMP;
// // 		// $scope.room.regUser = $rootScope.currentUser.regUser;

// // 		// Get a key for a new Post.
// // 		var newChecklistKey = ref.push().key();

// // 		$scope.room.id = newChecklistKey;

// // 		// Write the new post's data simultaneously in the checklist.
// // 		var update = {};
// // 		update[newChecklistKey] = $scope.room;
// // 		ref.update(update);
// // 		ref.on('value', function(snapshot) {
// // 		  debugger;
// // 		});
// // 	}
// });
.controller('ImageCtrl', function($scope, $cordovaCamera,  $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService, FIREBASE_URL, Draft, $q) {
	$scope.fileURI = [];
	$scope.done = false;
	$scope.uploadImageText = function(){
		if($scope.fileURI !== undefined && $scope.fileURI.length>0){
			return "Upload More";
		}else{
			return "Upload Image";
		}
	}
	$scope.options = {
	  loop: false,
	  effect: 'fade',
	  speed: 500,
	}
	$scope.$on('$ionicView.leave', function() {
      	// clear the image from localStorage
    })

	// $ionicPlatform.ready(function() {
	//     $scope.images = FileService.images();
	//     // $scope.$apply();
	// })
	 
	$scope.addMedia = function() {
	    $scope.hideSheet = $ionicActionSheet.show({
	      buttons: [
	        { text: 'Take photo' },
	        { text: 'Photo from library' }
	      ],
	      titleText: 'Add images',
	      cancelText: 'Cancel',
	      buttonClicked: function(index) {
	        $scope.addImage(index);
	      }
	    });
	}
	 
	$scope.addImage = function(type) {
	    $scope.hideSheet();
	    saveMedia(type).then(function() {
	      $scope.$apply();
	    });
	}

	function saveMedia(type) {
	    return $q(function(resolve, reject) {
	      var options = optionsForType(type); 
	      $cordovaCamera.getPicture(options).then(function(imageData) {
	        $scope.fileURI.push(imageData);
	      });
	    })
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
	      quality: 90,
	      // targetWidth: 100,
	      // targetHeight: 100,
	      destinationType: Camera.DestinationType.FILE_URI,
	      sourceType: source,// 0:Photo Library, 1=Camera, 2=Saved Photo Album
	      allowEdit: false,
	      encodingType: Camera.EncodingType.JPEG,
	      popoverOptions: CameraPopoverOptions,
	      saveToPhotoAlbum: false
	    };
	  }

	  // delete image
	   // Triggered on a button click, or some other target
	$scope.deleteImage = function(imgIndex) {
	   // Show the action sheet
	   	var hideSheet = $ionicActionSheet.show({
	     	buttons: [
	       		{ text: 'Delete' }
	     	],
	     	titleText: 'Delete Image',
	     	cancelText: 'Cancel',
	     	cancel: function() {
	          // add cancel code..
	        },
	     	buttonClicked: function(index) {
	     		$scope.hideSheet();
	      		$scope.fileURI.splice(imgIndex,1);
	      		$scope.$apply();
	    	}
	   	});
 	}

	$scope.openMailComposer = function() {
	  	alert($scope.fileURI);
	    
	    var bodyText = '<html><h2>Maintenance Reporting Detail</h2></html>';
	    var email = {
	        to: 'pramalakar.2010@gmail.com',
	        attachments: $scope.fileURI,
	        subject: 'Report Information',
	        body: bodyText,
	        isHtml: true
	      };

	    $cordovaEmailComposer.open(email).then(null, function() {
	     	//clear photoes
	     	$scope.done = true;
	    });
	}



// 	  //stores report to database
// 	  $scope.addChecklist = function(){

// 	  	Draft.addDraft($scope.room);

// 		var ref = new Firebase(FIREBASE_URL + '/checklist');
// 		$scope.room.date = Firebase.ServerValue.TIMESTAMP;
// 		// $scope.room.regUser = $rootScope.currentUser.regUser;

// 		// Get a key for a new Post.
// 		var newChecklistKey = ref.push().key();

// 		$scope.room.id = newChecklistKey;

// 		// Write the new post's data simultaneously in the checklist.
// 		var update = {};
// 		update[newChecklistKey] = $scope.room;
// 		ref.update(update);
// 		ref.on('value', function(snapshot) {
// 		  debugger;
// 		});
// 	}
});