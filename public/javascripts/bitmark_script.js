angular.module('myApp', ['angularMoment']).controller('mainController', function($scope, $http, $interval, $timeout) {

  $scope.data = {};
  $scope.post_glow = function (post) {
    return {  "box-shadow" : "0 0 " + post.marks / 2 + "px purple" };
  }



  $scope.post_style = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      for (var i in x)
        obj[i] = x[i];
    });
    return obj;
  }

  // extracts the value of cookie['state'].
  $scope.state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6);
  if     ($scope.state_cookie == "profile") { $scope.profile_status = true }
  else if($scope.state_cookie == "home") { $scope.home_status = true }
  else if($scope.state_cookie == "wallet") { $scope.wallet_status = true }
  else if($scope.state_cookie) { $scope.selected_style = {"max-width" : "650px", "width" : "650px" }; $scope.home_status = true; $scope.data.replyto = $scope.state_cookie; }
  else { $scope.home_status = true }

  $http.get("/api/posts").then(function(res) { $scope.posts = res.data });
  $interval(function(){
    $http.get("/api/posts").then(function(res) {
      $scope.posts = res.data;
    }
  )}, 500);

  $http.get("/api/info").then(function(res) {
    $scope.data.username = res.data.username;
    $scope.wallet = res.data.wallet;
    $scope.balance = res.data.balance;
  });
  $interval(function(){
    $http.get("/api/info").then(function(res) {
        $scope.balance = res.data.balance;
      }
    )}, 15000);

  $scope.disableClicks = function () {
    $scope.isDisabled = true;
    $timeout(function() { $scope.isDisabled = false }, 500)
  };

  $scope.mark = function (post) {
    post.marking_msg = $scope.marking_msg; $scope.marking_msg = "";
    $scope.data.username == post.username || $http.post("/api/mark/", post).then(function(){ $scope.balance--; });
  };

  $scope.select = function (post, $event) {
    $scope.selected_style = { "max-width" : "650px", "width" : "650px" };
    $scope.data.replyto = post._id;
    document.cookie = 'state=' + post._id;
    $scope.state_cookie = post._id;
  };

  $scope.back = function(post) {
    if (post.replyto) { document.cookie = 'state=' + post.replyto; $scope.state_cookie = post.replyto }
    else { document.cookie = 'state=home'; $scope.selected_style = "" }
  };

  $scope.create = function ($event) {
    $http.post("/api/create", $scope.data).then(function(res) {
      $scope.data.message = "";
      $event.target.blur();
      $event.target.rows = 1;
    })
  };

  $scope.logout = function() {
    document.cookie = 'login-cookie' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'state' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = "/";
  }

}).filter('reverse', function() {
    return function(items) {
      if (typeof items !== 'undefined') {
        return items.slice().reverse();
      }
    }
}).directive('autoFocus', function() {
  return {
    link: {
      post: function (scope, element, attr) { element[0].focus() }
    }
  }
});

