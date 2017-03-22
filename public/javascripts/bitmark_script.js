angular.module('myApp', ['angularMoment'])

  .controller('mainController', function($scope, $http, $interval) {

  $scope.data = {};
  $scope.data.username = "";
  $scope.data.post = "";
  // extracts the value of cookie['state'].
  $scope.state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6);
  if($scope.state_cookie == "profile") { $scope.profile_status = true }
  else if($scope.state_cookie == "home") { $scope.home_status = true }
  else if($scope.state_cookie == "wallet") { $scope.wallet_status = true }
  else if($scope.state_cookie) { $scope.selected_style = {"max-width" : "900px", "width" : "900px" }; $scope.home_status = true }
  else { $scope.home_status = true }

  $http.get("/api/posts").then(function(res) {$scope.posts = res.data} );
  $http.get("/api/replies").then(function(res) {$scope.replies = res.data} );

  $interval(function(){
    $http.get("/api/posts").then(function(res) {
      if ($scope.posts) {
       if ($scope.posts[$scope.posts.length-1].date != res.data[res.data.length-1].date) { $scope.posts = res.data }
      } else { $scope.posts = res.data }
  })}, 1000);

  $interval(function(){
    $http.get("/api/replies").then(function(res) {
      if ($scope.replies) {
        // Check to see if replies are synced with the response's version
        if ($scope.replies[$scope.replies.length-1].date != res.data[res.data.length-1].date) { $scope.replies = res.data }
      } else { $scope.replies = res.data }
  })}, 1000);

  $http.get("/api/bycookie").then(function(res) {
    $scope.data = res.data;
  });

  $scope.selected = null;
  $scope.reply = {};
  $scope.getSelected = function (post, $event) {
    $scope.selected = post;
    $scope.selected_style = { "max-width" : "900px", "width" : "900px" };
    $scope.reply.replyto = post._id;
    $scope.reply.username = $scope.data.username;
    document.cookie = 'state=' + post._id;
    $scope.state_cookie = post._id;
  };

  $scope.submitReply = function($event) {
    $http.post("/api/reply/", $scope.reply).then(function(res) {
      $scope.reply.post = ""
      $event.target.blur();
      $event.target.rows = 1;
    });
  };

  $scope.exitReply = function() {
    $scope.selected_style = "";
    document.cookie = 'state=home';
    $scope.selected = null;
  };

  $scope.submit_post = function ($event) {
    $http.post("/api/", $scope.data)
    .then(function(res) {
      $scope.data.post = ""
      $event.target.blur();
      $event.target.rows = 1;
    });
  };
  
  $scope.logout = function() {
    document.cookie = 'login-cookie' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'state' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = "/";
  }


}).filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
}).directive('stopEvent', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      if(attr && attr.stopEvent)
        element.bind(attr.stopEvent, function (e) {
          e.stopPropagation();
        });
    }
  };
});

