app = angular.module('myApp', ['angularMoment', 'ngRoute']);

<<<<<<< HEAD
// app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
//   var original = $location.path;
//   $location.path = function (path, reload) {
//     if (reload === false) {
//       var lastRoute = $route.current;
//       var un = $rootScope.$on('$locationChangeSuccess', function () {
//         $route.current = lastRoute;
//         un();
//       });
//     }
//     return original.apply($location, [path]);
//   };
// }]);

app.controller('mainController', function($scope, $http, $interval, $timeout) {
  $scope.data = {};
  $scope.notifications = [];
  $scope.cancel = false;
  $scope.message_needed = {};

  $scope.postGlow = function (post) {
    return {  "box-shadow" : "0 0 " + post.marks / 2 + "px purple" };
  };

  $scope.mergeObjs = function(objectList) {
=======
  $scope.data = {};
  
  $scope.post_glow = function (post) {
    return {  "box-shadow" : "0 0 " + post.marks / 2 + "px purple" };
  }

  $scope.post_style = function(objectList) {
>>>>>>> a76c4ca1452a12f34e6f989b754c2e7abe9eeb26
    var obj = {};
    objectList.forEach(function(x) {
      for (var i in x)
        obj[i] = x[i];
    });
    return obj;
  };

  // extracts the value of cookie['state'].
  $scope.state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6);
  if     ($scope.state_cookie == "profile") { $scope.profile_status = true }
  else if($scope.state_cookie == "home") { $scope.home_status = true; $scope.data.replyto = "" }
  else if($scope.state_cookie == "wallet") { $scope.wallet_status = true }
  else if($scope.state_cookie) { $scope.selected_style = { "width" : "650px" }; $scope.home_status = true; $scope.data.replyto = $scope.state_cookie; }
  else { $scope.home_status = true; $scope.state_cookie = "home"; document.cookie = 'state=home; expires=Thu, 01 Jan 2222 00:00:01 GMT; path=/;'; }


  $.get("/api/posts", function(data) { $scope.posts = data });
  setInterval(function(){
    $.get("/api/posts", function(data) {
      $scope.posts = data;
    })
  }, 500);

  $.get("/api/info", function(data) {
    $scope.data.username = data.username;
    $scope.wallet = data.wallet;
    $scope.balance = data.balance;
    $scope.notifications = data.notifications;
  });
  setInterval(function(){
    $.get("/api/info", function(data) {
      $scope.balance = data.balance;
      $scope.notifications = data.notifications;
    })
  }, 1000);

  $scope.fuck = function() {
    window.history.pushState("","","/api/post/");
    alert(window.location.pathname);
  };

  $scope.notificationClicked = function(notification) {
    $scope.select({'_id' : notification.id });
    $http.get("/api/delete_notification/" + notification.id).then(function(res) {})
  };

  $scope.reasonBlur = function (post) {
//    alert("entered disableClicks(), $scope.cancel is: " + $scope.cancel);
    $scope.cancel = false;
    $scope.isDisabled = true;
    $timeout(function() {
      $scope.isDisabled = false;
      if ($scope.cancel == false) {
        $scope.message_needed[post._id] = false;
        $scope.mark(post)
      }
    }, 200)
  };

  $scope.mark = function (post) {
    $scope.message_needed[post._id] = false;
//    alert("entered mark()" + $scope.message_needed);
    post.marking_msg = $scope.marking_msg; $scope.marking_msg = "";
    $scope.data.username == post.username || $http.post("/api/mark/", post).then(function(){ $scope.balance--; });
  };

  $scope.select = function (post) {
    // NON HTML5 compatable browsers must use only window.location.href = "/api/posts/" + post._id
    $scope.selected_style = { "width" : "650px" };
    $scope.data.replyto = post._id;
    document.cookie = 'state=' + post._id + "; expires=Thu, 01 Jan 2222 00:00:01 GMT; path=/;";
    $scope.state_cookie = post._id;
    window.scrollTo(0, 0);
    window.history.pushState("","","/api/posts/"+post._id)
    var height = document.getElementsByClassName("post")[0].offsetHeight;
    document.getElementById("reply").style.paddingTop = 20 + height + 'px';
  };

  $scope.notificationAmount = function () {
    var amount = 0;
    $scope.notifications.forEach(function(n) { amount += n.amount });
    return amount
  };

  $scope.back = function(post) {
    document.cookie = 'state=' + post.replyto + "; expires=Thu, 01 Jan 2222 00:00:01 GMT; path=/;";
    if (post.replyto) {
      $scope.state_cookie = post.replyto;
      $scope.data.replyto = post.replyto;
      //window.location.href = "/api/posts/" + post.replyto;
    }
    else {
      //window.location.href = "/"
      $scope.selected_style = ""; $scope.data.replyto = "";
      window.history.pushState("","","/");
    }
    window.scrollTo(0, 0);
  };

  $scope.create = function ($event) {
    $http.post("/api/create", $scope.data).then(function(res) {
      $scope.data.message = "";
      $event.target.blur();
      $event.target.rows = 1;
    })
  };


  $scope.logout = function() {
    document.cookie = 'login-cookie' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
    document.cookie = 'state' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
    window.location.href = "/";
  };


  //$timeout(function() { alert(window.location.pathname)},4000);


}).filter('reverse', function() {
    return function(items) {
      if (typeof items !== 'undefined') {
        return items.slice().reverse();
      }
    }
}).directive('focusOnShow', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      if ($attr.ngShow){
        $scope.$watch($attr.ngShow, function(newValue){
          if(newValue){
            $timeout(function(){
              $element[0].focus();
            }, 0);
          }
        })
      }
      if ($attr.ngHide){
        $scope.$watch($attr.ngHide, function(newValue){
          if(!newValue){
            $timeout(function(){
              $element[0].focus();
            }, 0);
          }
        })
      }

    }
  };
}).directive('autoFocus', function() {
  return {
    link: {
      post: function (scope, element, attr) { element[0].focus() }
    }
  }
}).directive('postHeight', function($timeout){
  return {
    link: {
      post: function (scope, element, attr) {
        $timeout(function(){
          var result = document.getElementsByClassName("post")[0];
          var height = result.scrollHeight || 170;
          element[0].style.paddingTop = height + +attr.postHeight + "px";
        }, 400)
      }
    }
  }
});