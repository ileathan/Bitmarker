angular.module('myApp', ['angularMoment']) 

.controller('mainController', function($scope, $http, $interval) {

  $scope.data = {};
  $scope.data.username = "";
  $scope.data.post = "";
  // extracts the value of cookie['state'].
  state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6)
  if(state_cookie == "profile") $scope.profile_status=true;  
  if(state_cookie == "home") $scope.home_status=true;  
  if(state_cookie == "wallet") $scope.wallet_status=true;  

  $http.get("/api/posts").then(function(res) {$scope.posts = res.data} );

  $interval(function(){
    $http.get("/api/posts").then(function(res) {
    if ($scope.posts) {
      if ($scope.posts[$scope.posts.length-1].date != res.data[res.data.length-1].date) { $scope.posts = res.data }
    } else { $scope.posts = res.data } 
  })}, 1000);

  $http.get("/api/bycookie").then(function(res) {
    $scope.data.username = res.data.username;
  });

  $scope.submit_post = function ($event) {
    $http.post("/api/", $scope.data)
    .then(function(res) {
      $scope.data.post = ""
      $event.target.blur();
      $event.target.rows = 1;
    });
  }
  
  $scope.logout = function() {
    document.cookie = 'login-cookie' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = "/";
  }


}).filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
