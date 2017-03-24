angular.module('myApp', ['angularMoment'])

  .controller('mainController', function($scope, $http, $interval) {

  $scope.data = {};
  $scope.data.username = "";
  $scope.data.post = "";
  $scope.wallet = "";
  $scope.balance = "";
  // extracts the value of cookie['state'].
  $scope.state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6);
  if($scope.state_cookie == "profile") { $scope.profile_status = true }
  else if($scope.state_cookie == "home") { $scope.home_status = true }
  else if($scope.state_cookie == "wallet") { $scope.wallet_status = true }
  else if($scope.state_cookie) {
    setTimeout(function(){
      document.getElementById('workaround').style.width="900px";
      document.getElementById('workaround').style.maxWidth="900px";
    }, 100);
    $scope.selected_style = {"max-width" : "900px", "width" : "900px" }; $scope.home_status = true;
  }
  else { $scope.home_status = true }

  $http.get("/api/posts").then(function(res) {$scope.posts = res.data} );
  $http.get("/api/replies").then(function(res) {$scope.replies = res.data} );

  $interval(function(){
    $http.get("/api/posts").then(function(res) {
      //if ($scope.posts) {
      // if ($scope.posts[$scope.posts.length-1].date != res.data[res.data.length-1].date) { $scope.posts = res.data }
      //} else { $scope.posts = res.data }
      $scope.posts = res.data;
  })}, 500);

  $interval(function(){
    $http.get("/api/replies").then(function(res) {
      //if ($scope.replies) {
      // Check to see if replies are synced with the response's version
      //  if ($scope.replies[$scope.replies.length-1].date != res.data[res.data.length-1].date) { $scope.replies = res.data }
      //} else { $scope.replies = res.data }
      $scope.replies = res.data;
  })}, 500);

  $http.get("/api/bycookie").then(function(res) {
    $scope.data.username = res.data.username;
    $scope.wallet = res.data.wallet;
    $scope.balance = res.data.balance;
  });

  $scope.markPost = function (post) {
    $http.get("/api/mark/" + post._id).then();
  };
  $scope.markReply = function (post) {
    $http.get("/api/markReply/" + post._id).then();
  };

  $scope.calculateBlueValue = function (marks, position) {
    blueValue = 255;
    if (position == 1) {
      if (marks > 17) blueValue = 255-((marks-17)*6);
    } else {
      if (marks > 35) blueValue = 255-((marks-35)*6);
    }
    if (blueValue < 100) blueValue = 100;
    return blueValue;
  };
  $scope.calculateRedValue = function (marks, position) {
    redValue = 255;
    if (position == 1) {
      redValue = 255 - marks * 5;
    } else {
      if (marks > 35) redValue = 255-((marks-35)*5);
    }
    if (redValue<65) redValue=65;
    return redValue;
  };

  $scope.selected = null;
  $scope.reply = {};
  $scope.getSelected = function (post, $event) {
    $scope.selected_post = post;
//    alert($scope.selected_post);
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

  $scope.submitPost = function ($event) {
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
}).directive('sglclick', ['$parse', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      var fn = $parse(attr['sglclick']);
      var delay = 300, clicks = 0, timer = null;
      element.on('click', function (event) {
        clicks++;  //count clicks
        if(clicks === 1) {
          timer = setTimeout(function() {
            scope.$apply(function () {
              fn(scope, { $event: event });
            });
            clicks = 0;             //after action performed, reset counter
          }, delay);
        } else {
          clearTimeout(timer);    //prevent single-click action
          clicks = 0;             //after action performed, reset counter
        }
      });
    }
  };
}]);

//window.onload(function(){
//  var state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6);
//  if (state_cookie != "home" && state_cookie != "profile" && state_cookie != "wallet" && state_cookie) {
//   alert(JSON.stringify(document.getElementById('workaround')));
//    document.getElementById('workaround').style.width="900px";
//    document.getElementById('workaround').style.maxWidth="900px";
//  }
//});
