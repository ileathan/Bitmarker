angular.module('myApp', []) 

.controller('mainController', function($scope, $http) {

  $scope.data = { username: { value: "", information: "", style: "" }, password: { value: "", information: "", style: "" }, password2: { value: "", information: "", style: "" } };

  $scope.validatePassword = function() {
    // Return if user is not creating an account or password field is empty.
    if(!$scope.account_create || !$scope.data.password.value) { return }
    if ($scope.data.password.value.length < 7) { $scope.data.password.style = "has-error"; $scope.data.password.information = "Atleast 7 chars long"; return  }
    $scope.data.password.style = "has-success"; $scope.data.password.information = "";
  };

  $scope.validatePassword2 = function() {
    // Return if password2 field is empty.
    if (!$scope.data.password2.value) { return }
    if ($scope.data.password.value != $scope.data.password2.value) { $scope.data.password2.style = "has-error"; $scope.data.password2.information = "Doesn't match"; return  }
    $scope.data.password2.style = "has-success"; $scope.data.password2.information = "";
  };

  $scope.validateUsername = function() {
    // Return if user is not creating an account or the username field is empty.
    if(!$scope.account_create || !$scope.data.username.value) { return }
    if(/[^a-zA-Z0-9]/.test($scope.data.username.value)) { $scope.data.username.style = "has-error"; $scope.data.username.information = "Aplhanumeric chars only"; return }
    $http.get("/users/" + $scope.data.username.value).then(function(res) {
      if (res.data != "That user does not exist.") { $scope.data.username.style = "has-error"; $scope.data.username.information = "Username taken"; }
      else { $scope.data.username.style = "has-success"; $scope.data.username.information = "" }
      if(!$scope.data.username.value) { $scope.data.username.value = ""; $scope.data.username.style = ""; $scope.data.username.information = "" }
    })
  };

  $scope.createAccount = function() {
    if (!$scope.account_create) { $scope.account_create = true; $scope.validateUsername(); $scope.validatePassword(); $scope.validatePassword2(); return }
    if ($scope.data.username.information || $scope.data.password.information || $scope.data.password2.information) { alert("Please correct your errors."); return }
    $http.post("/users/createAccount", { 'username': $scope.data.username.value, 'password': $scope.data.password.value }).then(function(res) {
      alert("Account created, logging you in as '" + res.data.username + "'.");
      $scope.account_create = false; $scope.login()
    })
  };

  $scope.login = function() {
    if (!$scope.account_create) {
      $http.post("/users/login", { "username": $scope.data.username.value, "password": $scope.data.password.value }).then(function(res) {
        if (res.data == "ERROR") alert("You did not enter anything that matches our records, perhaps create an account first?");
        window.location.href = "/";
      });
    } else {
      $scope.account_create = false;
      $scope.data.username.information = "";
      $scope.data.username.style = "";
      $scope.data.password.information = "";
      $scope.data.password.style = "";
      $scope.data.password2.value = "";
    }
  }
});
