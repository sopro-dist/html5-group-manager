var Cambrian = Cambrian || {};
var japi;
if(Cambrian.JAPI !== undefined && !Cambrian.isMockCambrian){
  console.log('Instantiating japi');
  japi = Cambrian.JAPI();
} else {
  // use mocks
  console.log('Instantiating mock japi');
  japi = Cambrian.mockJAPI();
}

//appModule = angular.module("app", ['eee-c.angularBindPolymer'])

var GROUP_TYPES = ['broadcast', 'open'];
var CORPS_TYPES = ['corporation', 'coalition'];

appModule = angular.module("app", ['ngRoute','ngMaterial'])
.config(function($routeProvider){
  
  $routeProvider.when("/groups", {
    templateUrl: "partials/groups.tmpl.html",
    controller: "groupsCtrl"
  }).
  when("/corps", {
    templateUrl: "partials/corps.tmpl.html",
    controller: "corpsCtrl"
  }).
  otherwise({
    redirectTo: "/corps"
  });
})
.factory("menu", ['$rootScope', function ($rootScope) {
  var self;
  var groups = ['myGroups', 'myPeerLists'];

  return self = {
    groups: groups,

    selectGroup: function(group) {
      self.currentGroup = group;
      $rootScope.listContains = group;
    },
    isGroupSelected: function (group) {
      return self.currentGroup === group;
    }
  };

}])
.controller("groupsCtrl", function ($scope, $materialSidenav, $materialDialog, menu, $rootScope) {
  
  $scope.menu = menu;
  $scope.menu.selectGroup(menu.groups[0]);
  document.title = "Private Groups";
  $scope.myPeers = japi.me.peers;
  var groups = japi.me.groups;
  $scope.myGroups = [];
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].type != "channel") {
      $scope.myGroups.push(groups[i]);
    }
  };
  $scope.invites = [
    {
      name: "Hiro's Channel",
      members: 4,
    },
    {
      name: "Soccer Team",
      members: 10,
    },
  ];
  $scope.myPeerLists = japi.me.peerLists;
  $scope.groupTypes = GROUP_TYPES;
  $scope.inputClick = false;
  $scope.value = [false,true,true,false];

  for (var i=0; i < $scope.myGroups.length; i++) {
    $scope.myGroups[i].isActive = false;
  };

  /*
  for (var i=0; i < $scope.myPeerLists.length; i++) {
    $scope.myGroups.isActive[i] = false;
  };
  */

  $(document).mouseup(function (e) {
    var container = $("#quickAddBox");
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
      var exists = ($('#quickAddBox').length === 1)
      if (exists) {
        $scope.$apply(function() {
          $scope.inputClick = false;
          $scope.newGroupType = "";
          $scope.newGroupTitle = "";
          $scope.quickAddForm.$setPristine();
        });       
      }
    }
  });

  $scope.toggleMenu = function () {
    $materialSidenav('left').toggle();
  };

  $scope.listView = "quilt";

  $scope.streamView = function () {
    $scope.listView = "stream";
  };

  $scope.quiltView = function () {
    $scope.listView = "quilt";
  };

  $scope.overflowToggle = function (group) {
    group.overflow = !group.overflow;
  };

  $scope.newGroup = function (e) {
    //var groupToAdd = { name: $scope.newGroupTitle, groupType: $scope.newGroupType, members: []};
    if ($scope.newGroupType) {
      $scope.newGroupType = $scope.groupTypes[0];
    }
    var groupToAdd = japi.groups.build('open');
    groupToAdd.name = $scope.newGroupTitle;
    groupToAdd.type = $scope.newGroupType;
    groupToAdd.members = [];
    $scope.myGroups.push(groupToAdd);
    groupToAdd.save();
    $scope.newGroupTitle = "";
    $scope.quickAddForm.$setPristine();
    $scope.dialog(e, groupToAdd);
  };

  $scope.duplicateGroup = function (e,group) {
    //var buildGroup = angular.copy(group);
    var buildGroup = japi.groups.build('open');
    console.log(buildGroup);
    buildGroup.name = group.name + " (Duplicate)";
    buildGroup.type = group.type;
    buildGroup.overflow = false;
    $scope.myGroups.push(buildGroup);
    buildGroup.save();
    $scope.dialog(e, groupToAdd);
  };

  $scope.deleteGroup = function (group) {
    var confirmed = confirm('Are you sure you want to permanently remove the group:\n'+(group.name || ""));
    if(!confirmed){ return }
    var index = $scope.myGroups.indexOf(group);

    if (index > -1) {
      $scope.myGroups.splice(index, 1);  
    }
    group.overflow = false;
    group.destroy();
  };

  $scope.dialog = function (e, group) {
    $materialDialog({
      templateUrl: 'partials/editGroupCard.tmpl.html',
      targetEvent: e,
      controller: ['$scope', '$hideDialog', function ($scope, $hideDialog) {
        $scope.group = group;
        $scope.japi = japi;
        $scope.newGroupType = group.type;
        console.log('Setting dialog $scope.newGroupType to ',group.type)
        $scope.groupTypes = GROUP_TYPES;
        $scope.newGroupTitle = group.name;

        // Filter to display only nonMembers:
        $scope.nonMembers = function(peer){
          for(var i=0; i<$scope.group.members.length; i++){
            if(angular.equals($scope.group.members[i], peer)){ // Peer was found
              return false; // this member should be hidden
            }
          }
          return true; // this nonmember should be shown
        };
        $scope.close = function () {
          $hideDialog();
        };

        $scope.save = function (group) {
          group.save()
          $hideDialog();
        };
      }]
    });
  };

})
.controller("corpsCtrl", function ($scope, $materialSidenav, $materialDialog, menu, $rootScope) {
  
  $scope.menu = menu;
  $scope.menu.selectGroup(menu.groups[0]);
  document.title = "Corps and Coalitions";
  $scope.myPeers = japi.me.peers;
  $scope.newGroupType = 'corporation';
  $scope.myGroups = [
    {
      name: "Brave Newbies Inc.",
      type: "corporation",
      members: 8180,
      ticker: "[SB00N]" ,
      ceo:"Lychton Kondur",
      alliance:"Brave Collective",
      faction:"",
      avgSec: 0.3
    },
    {
      name: "Brothers of Tangra",
      type: "coalition",
      members: 11289,
      ticker: "<B0T>" ,
      avgSec: 2.2,
      execCorp:"BOT EXECS",
      nCorps: 242,
      img: "default"
    },
    {
      name: "Goonwaffe",
      type: "corporation",
      members: 2457,
      ticker: "[GEWNS]" ,
      ceo:"The Mittani",
      alliance:"Goonswarm Federation",
      faction:"",
      avgSec: 1.9 
    },
    {
      name: "Royal Pirates",
      type: "corporation",
      members: 25,
      ticker: "[RPSQ]" ,
      ceo:"GhostMoon",
      alliance:"",
      faction:"",
      avgSec: -4.9 
    },
    {
      name: "Red Federation",
      type: "corporation",
      members: 3978,
      ticker: "[R-FED]" ,
      ceo:"Delucian",
      alliance:"RvB - RED Federation",
      faction:"",
      avgSec: 0.5
    },
    {
      name: "Shadow Cartel",
      type: "coalition",
      members: 465,
      ticker: "<SHDWC>" ,
      avgSec: -5.0,
      execCorp:"Immortalis Inc.",
      nCorps: 15,
      img: "SHDWC"
    },
    {
      name: "Free Space Tech",
      type: "corporation",
      members: 744,
      ticker: "[FSP-T]" ,
      ceo:"Groberr",
      alliance:"Banderlogs Alliance",
      faction:"",
      avgSec: 2.1
    },
    {
      name: "CBC Interstellar",
      type: "corporation",
      members: 168,
      ticker: "[-CBC-]" ,
      ceo:"Ektobus Rired",
      alliance:"Fidelas Constans",
      faction:"",
      avgSec: 4 
    },
    {
      name: "Hard Knocks Inc.",
      type: "corporation",
      members: 281,
      ticker: "[HRDKX]" ,
      ceo:"Ayeson",
      alliance:"",
      faction:"",
      avgSec: 1
    },
    {
      name: "DeepSpace Manufacturers",
      type: "corporation",
      members: 526,
      ticker: "[DMANS]" ,
      ceo:"Danalkaelra",
      alliance:"Brothers of Tangra",
      faction:"",
      avgSec: 1.8 
    },
    {
      name: "Spartan Industries",
      type: "corporation",
      members: 583,
      ticker: "[-SPA-]" ,
      ceo:"AgentLactic II",
      alliance:"",
      faction:"",
      avgSec: 0
    },
    {
      name: "Love Squad",
      type: "corporation",
      members: 10433,
      ticker: "[WOMYN]" ,
      ceo:"Capqu",
      alliance:"Pasta Syndicate",
      faction:"",
      avgSec: 0.2
    },
    {
      name: "The Bastion",
      type: "coalition",
      members: 3490,
      ticker: "<BASTN>" ,
      avgSec: 1.9,
      execCorp:"Ancient Hittite Corporation",
      nCorps: 50,
      img: "default"
    },
    {
      name: "Blake Industries",
      type: "corporation",
      members: 138,
      ticker: "[BIPL]" ,
      ceo:"xepiov",
      alliance:"Firmus Ixion",
      faction:"",
      avgSec: 1
    },
    {
      name: "Lords of Anarchy",
      type: "corporation",
      members: 78,
      ticker: "[-CHAM]" ,
      ceo:"Eldenmer Volkerball",
      alliance:"",
      faction:"",
      avgSec: 1.2
    },
    {
      name: "Everlasting Vendetta",
      type: "corporation",
      members: 2,
      ticker: "[EVER]" ,
      ceo:"Eldder Vendetta",
      alliance:"",
      faction:"",
      avgSec: 0
    },
    {
      name: "Northern Associates",
      type: "coalition",
      members: 13694,
      ticker: "<NA.>" ,
      avgSec: 2.3,
      execCorp:"Northern Associates Holdings",
      nCorps: 382,
      img: "default"
    },
    {
      name: "JP514",
      type: "coalition",
      members: 7,
      ticker: "<JP514>" ,
      avgSec: 0.1,
      execCorp:"Ravenclawarts514",
      nCorps: 1,
      img: "default"
    }
  ];
  for (var i = 0; i < $scope.myGroups.length; i++) {
    $scope.myGroups[i].rules = [];
  };
  $scope.myPeerLists = japi.me.peerLists;
  $scope.groupTypes = CORPS_TYPES;
  $scope.inputClick = false;

  for (var i=0; i < $scope.myGroups.length; i++) {
    $scope.myGroups[i].isActive = false;
  };

  /*
  for (var i=0; i < $scope.myPeerLists.length; i++) {
    $scope.myGroups.isActive[i] = false;
  };
  */

  $(document).mouseup(function (e) {
    var container = $("#quickAddBox");
    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
      var exists = ($('#quickAddBox').length === 1)
      if (exists) {
        $scope.$apply(function() {
          $scope.inputClick = false;
          $scope.newGroupType = "";
          $scope.newGroupTitle = "";
          $scope.quickAddForm.$setPristine();
        });       
      }
    }
  });

  $scope.toggleMenu = function () {
    $materialSidenav('left').toggle();
  };

  $scope.listView = "quilt";

  $scope.streamView = function () {
    $scope.listView = "stream";
  };

  $scope.quiltView = function () {
    $scope.listView = "quilt";
  };

  $scope.overflowToggle = function (group) {
    group.overflow = !group.overflow;
  };

  $scope.newGroup = function () {
    //var groupToAdd = { name: $scope.newGroupTitle, groupType: $scope.newGroupType, members: []};
    if ($scope.newGroupType) {
      $scope.newGroupType = $scope.groupTypes[0];
    }
    var groupToAdd = japi.groups.build('open');
    groupToAdd.name = $scope.newGroupTitle;
    groupToAdd.type = $scope.newGroupType;
    groupToAdd.members = 0;
    groupToAdd.rules = [];
    $scope.myGroups.push(groupToAdd);
    $scope.newGroupTitle = "corporation";
    $scope.quickAddForm.$setPristine();
    $scope.dialog(null, groupToAdd);
  };

  $scope.duplicateGroup = function (group) {
    //var buildGroup = angular.copy(group);
    var buildGroup = japi.groups.build(group);
    console.log(buildGroup);
    buildGroup.name = buildGroup.name + " (Duplicate)";
    buildGroup.overflow = false;
    $scope.myGroups.push(buildGroup);
    group.overflow = false;
  };

  $scope.deleteGroup = function (group) {
    var confirmed = confirm('Are you sure you want to permanently remove the group:\n'+(group.name || ""));
    if(!confirmed){ return }
    var index = $scope.myGroups.indexOf(group);

    if (index > -1) {
      $scope.myGroups.splice(index, 1);  
    }
    group.overflow = false;
    group.destroy();
  };

  $scope.dialog = function (e, group) {
    $materialDialog({
      templateUrl: 'partials/editCorpCard.tmpl.html',
      targetEvent: e,
      controller: ['$scope', '$hideDialog','$rootScope','$timeout', function ($scope, $hideDialog, $rootScope,$timeout) {
        $scope.group = group;
        $scope.japi = japi;
        $scope.newGroupType = group.type;
        console.log('Setting dialog $scope.newGroupType to ',group.type)
        $scope.groupTypes = GROUP_TYPES;
        $scope.newGroupTitle = group.name;

        function resizeInput() {
            $(this).attr('size', $(this).val().length);
        }

        $('input[type="text"]')
            // event handler
            .keyup(resizeInput)
            // resize on page load
            .each(resizeInput);

        $timeout(function () {
          $("#addRuleInput").focus();
        }); 

        $scope.keypressListener = function (event) {
          if (event.charCode == 13) {
            $timeout(function () {
              $("#addRuleInput").focus();
            });
          }
        }

        $scope.checkForRuleDelete = function ($event,$index) {
          if($scope.group.rules[$index].text === '' && $event.keyCode === 8) {
            if ($scope.group.rules[$index].empty != undefined && $scope.group.rules[$index].empty) {
              $scope.group.rules.splice($index, 1);
              var previousChild;
              if ($index > 0) {
                previousChild = $index - 1;
              } else {
                if ($scope.group.rules.length > 0) {
                  previousChild = 0;
                } else {
                  $scope.keypressListener({"charCode":13});
                  return;
                }
              }
              $timeout(function () {
                document.getElementById("rule"+previousChild).focus();
              });
            } else {
              $scope.group.rules[$index].empty = true;
            }
          }
        };

        $scope.removeRule = function ($index) {
          $scope.group.rules.splice($index, 1);
        };

        $scope.addRule = function (newRuleText) {
          var newRule = { text: newRuleText};
          $scope.group.rules.push(newRule);
          var index = $scope.group.rules.length - 1;
          var id = "rule"+index;
          $timeout(function () {
            document.getElementById(id).focus();
          });
          return "";
        };

        // Filter to display only nonMembers:
        $scope.nonMembers = function(peer){
          for(var i=0; i<$scope.group.members.length; i++){
            if(angular.equals($scope.group.members[i], peer)){ // Peer was found
              return false; // this member should be hidden
            }
          }
          return true; // this nonmember should be shown
        };
        $scope.close = function () {
          $hideDialog();
        };

        $scope.save = function (group) {
          //group.save()
          for (var i = 0; i<group.rules.length; i++) {
            if (!group.rules[i].text) {
              group.rules.splice(i,1);
            }
          }
          $hideDialog();
        };
      }]
    });
  };


});