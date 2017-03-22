angular.module('myApp', []) 

.controller('mainController', function($scope, $http) {

  // define some random object
  $scope.data = {};
  
  $scope.data.username = "";
  $scope.data.password = "";
  // $scope.data.email = "";
  $scope.username_status = "";
  $scope.account_create = false;  

  $scope.validatePassword = function() {
    if(!$scope.account_create) { return }
    if ($scope.data.password.length < 7) { $scope.password_status = "has-error"; $scope.password_information = "Atleast 7 chars long"; return  }
    $scope.password_status = "has-success"; $scope.password_information = "";
  }

  $scope.validatePassword2 = function() {
    if ($scope.data.password != $scope.data.password2) { $scope.password2_status = "has-error"; $scope.password2_information = "Doesn't match"; return  }
    $scope.password2_status = "has-success"; $scope.password2_information = "";
  }

  $scope.validateUsername = function() {
    if(!$scope.account_create) { return }
    if(/[^a-zA-Z0-9]/.test($scope.data.username)) { $scope.username_status = "has-error"; $scope.username_information = "Aplhanumeric chars only"; return }
    $http.get("/users/" + $scope.data.username)
    .then(function(res) {
      if(res.data) { $scope.username_status = "has-error"; $scope.username_information = "Username taken"; }
      else { $scope.username_status = "has-success"; $scope.username_information = "" }
      if($scope.data.username == "") { $scope.username_status = ""; $scope.username_information = "" }
    });
  }

  $scope.createAccount = function() {
    if($scope.account_create==false){$scope.account_create=true; return}
    if ($scope.username_information) {alert("Please correct your errors."); return;}
    $http.post("/users/", $scope.data).then(function(res) {
      alert("Account created, you may now log in as '" + res.data.username + "'.");
      $scope.account_create = false; $scope.username_status = ""; $scope.password_status = "";
    });
  }

  $scope.login = function() {
    if ($scope.account_create == false) {
      $http.post("/users/login", {"username": $scope.data.username, "password": $scope.data.password}).then(function(res) {
        if (res.data == "ERROR") alert("You did not enter anything that matches our records, perhaps create an account first?");
        window.location.href = "/";
      });
    } else if ($event.keyCode != 13) {
      $scope.account_create = false;
    }
  }
});
