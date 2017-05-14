angular.module('myApp', ['angularMoment', 'ngRoute'])

.config(function($locationProvider) {
  $locationProvider.html5Mode({ enabled: true, requireBase: false })
})

.controller('mainController', function($scope, $http, $interval, $timeout, $location) {
  $scope.state_cookie = document.cookie.substr(document.cookie.indexOf("state")+6, document.cookie.indexOf(";")-6);
  $scope.data = {}; $scope.message_needed = {}; $scope.replyto = ""; $scope.loaded = {}; $scope.isPadable = true;

  $scope.postGlow = function (post) {
    return {  "box-shadow" : "0 0 " + post.marks / 2 + "px purple" };
  };

  $scope.mergeStyles = function(objectList) {
    var obj = {};
    objectList.forEach(function(x) {
      for (var i in x)
        obj[i] = x[i];
    });
    return obj;
  };


  $http.get("/api/posts").then(function(res) { $scope.posts = res.data });
  $interval(function(){
    $http.get("/api/posts").then(function(res) {
      $scope.posts = res.data;
    })
  }, 500);

  $http.get("/api/info").then(function(res) { $scope.data = res.data });
  $interval(function(){
    $http.get("/api/info").then(function(res) {
      $scope.data = res.data;
    })
  }, 1000);

  $scope.notificationClicked = function(notification) {
    $scope.select({'_id' : notification.id });
    $http.get("/api/delete_notification/" + notification.id).then(function(res) {})
  };

  $scope.reasonBlur = function (post) {
    $scope.cancel = false;
    $scope.isDisabled = true;
    $timeout(function() {
      $scope.isDisabled = false;
      if (!$scope.cancel) {
        $scope.message_needed[post._id] = false;
        $scope.mark(post)
      }
    }, 200)
  };

  $scope.mark = function (post) {
    $scope.message_needed[post._id] = false;
    post.marking_msg = $scope.marking_msg; $scope.marking_msg = "";
    $scope.data.username == post.username || $http.post("/api/mark/", post).then(function(){ $scope.balance--; });
  };

  $scope.updateState = function (path, data) {
    var data_state_cookie = data;
    if (data == 'home') {
      if ($scope.replyto.length == 24) data_state_cookie = $scope.replyto;
    }
    $location.old = $location.state();
    $location.new = {
      selected_style: ($scope.replyto.length==24?{ 'width': '650px' }:''),
      replyto: $scope.replyto, //(data.length==24?data:$scope.replyto),
      state_cookie: data_state_cookie
    };
    if ($location.new.state_cookie === $location.old.state_cookie) return;
    data == 'home' && (data = '');
    $location.state($location.new).path(path + data);
   };

  $scope.select = function (post) {
    $scope.selected_style = {"width": "650px"};
    $scope.replyto = post._id;
    document.cookie = 'state=' + post._id + "; expires=Thu, 01 Jan 2222 00:00:01 GMT; path=/;";
    $scope.state_cookie = post._id;
    window.scrollTo(0, 0);
    $scope.updateState('/api/posts/', post._id);
  };

  if ($scope.state_cookie.length === 24) $scope.select({'_id': $scope.state_cookie});


  // Watch for location changes so we can apply state accordingly
  $scope.$on('$locationChangeSuccess', function (a, newUrl, oldUrl) {
    var state_data = $location.state();
    $scope.selected_style = state_data.selected_style;
    $scope.replyto = state_data.replyto;
    $scope.state_cookie = state_data.state_cookie;
    document.cookie = 'state=' + state_data.state_cookie + '; expires=Thu, 01 Jan 2222 00:00:01 GMT; path=/;';
    window.scrollTo(0,0);
  });

  $scope.notificationAmount = function () {
   var amount = 0;
   $scope.data.notifications.forEach(function(n) { amount += n.amount });
   return amount
  };

  $scope.back = function(post) {
    document.cookie = 'state=' + post.replyto + "; expires=Thu, 01 Jan 2222 00:00:01 GMT; path=/;";
    if (post.replyto) {
      $scope.state_cookie = post.replyto;
      $scope.replyto = post.replyto;
      $scope.updateState('/api/posts/', post.replyto)
    } else {
      $scope.selected_style = ""; $scope.replyto = "";
      $scope.updateState('/', 'home');
    }
    window.scrollTo(0, 0);
  };

  $scope.create = function ($event) {
    $http.post("/api/create", { 'message': $scope.message, 'replyto': $scope.replyto }).then(function(res) {
      $scope.message = ""; $event.target.blur(); $event.target.rows = 1;
    })
  };

  $scope.cancelMarking = function(post) {
    $scope.message_needed[post._id] = false; $scope.marking_msg = ''; $scope.cancel = true;
  };

  $scope.logout = function() {
    document.cookie = 'login-cookie' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
    document.cookie = 'state' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
    window.location.href = "/";
  };

  $scope.stopPad = function() {
    alert(1)
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
 }).directive('loaded', function(){
   return {
     restrict: 'A',
     link: function(scope, elem, attr) {
       scope.$watch(function () {
         try { return document.getElementById(attr.loaded).scrollHeight } catch(e) { return }
       }, function (newVal) {
         if (!newVal) return;
         if (!scope.isPadable) return;
         elem[0].style.paddingTop = newVal + 10 + 'px';
       })
     }
   }
});