(function () {
	'use strict';

	angular.module('users')

	// -------------------------------------------------------------------------
	//
	// overarching settings controller, does not do anything really
	//
	// -------------------------------------------------------------------------
	.controller('SettingsController', function ($scope, Authentication) {
		var vm = this;
		vm.features = window.features;
		vm.user = Authentication.user;
	})
	// -------------------------------------------------------------------------
	//
	// controller for privacy
	//
	// -------------------------------------------------------------------------
	.controller('ProfilePrivacyController', function ($scope, subscriptions, Authentication, UsersService, Notification) {
		var vm = this;
		vm.user = angular.copy(Authentication.user);
		vm.user.notifyOpportunities = subscriptions.map (function (s) {return (s.notificationCode === 'not-add-opportunity');}).reduce (function (a, c) {return (a || c);}, false);
		vm.features = window.features;
		vm.savePrivacy = function(isValid) {
			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'vm.userForm');
				return false;
			}
			var successMessage = '<h4>Changes Saved</h4>';
			// Don't need these extras to pop up
		//	if (vm.user.notifyOpportunities) {
		//		successMessage += '<p>We will send you notifications of new Code With Us Opportunities.</p>';
		//	}
		//	if (vm.user.isPublicProfile) {
		//		successMessage += '<p>Your profile will be made public.</p>';
		//	}
		//	if (vm.user.isAutoAdd) {
		//		successMessage += '<p>You may be automatically added to teams under your organizations.</p>';
		//	}
			var user = new UsersService(vm.user);
			user.$update(function (response) {
				$scope.$broadcast('show-errors-reset', 'vm.userForm');
				Notification.success({ delay:2000, message: '<i class="fa fa-3x fa-check-circle"></i> '+successMessage});
				Authentication.user = response;
				vm.user = angular.copy(Authentication.user);
			}, function (response) {
				Notification.error({ message: response.data.message, title: '<i class="fa fa-3x fa-exclamation-triangle"></i> Edit profile failed!' });
			});
		}
	})
	// -------------------------------------------------------------------------
	//
	// controller for skills
	//
	// -------------------------------------------------------------------------
	.controller('ProfileSkillsController', function ($scope, $sce, Notification, dataService, Authentication, UsersService, capabilities, CapabilitiesMethods, TINYMCE_OPTIONS) {
		var vm                     = this;
		vm.features                = window.features;
		vm.trust                   = $sce.trustAsHtml;
		vm.user                    = angular.copy (Authentication.user);
		vm.tinymceOptions          = TINYMCE_OPTIONS;
		//
		// set up the structures for capabilities
		//
		CapabilitiesMethods.init (vm, vm.user, capabilities);
		// -------------------------------------------------------------------------
		//
		// perform the actual update
		//
		// -------------------------------------------------------------------------
		vm.updateUserProfile = function (isValid) {
			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'vm.userForm');
				return false;
			}
			//
			// reconcile the meta version of the capability data into the model
			//
			CapabilitiesMethods.reconcile (vm, vm.user);
			//
			// do the update
			//
			(new UsersService(vm.user)).$update (
				function (response) {
					Authentication.user = response;
					vm.user             = angular.copy(Authentication.user);
					$scope.$broadcast ('show-errors-reset', 'vm.userForm');
					Notification.success ({ delay:2000, message: '<i class="fa fa-3x fa-check-circle"></i> <h4>Changes saved</h4>'});
					CapabilitiesMethods.init (vm, vm.user, capabilities);
				}, function (response) {
					Notification.error ({ message: response.data.message, title: '<i class="fa fa-alert-triangle"></i> Changes were not saved!' });
			});
		}
	})
	// -------------------------------------------------------------------------
	//
	// controller for messages
	//
	// -------------------------------------------------------------------------
	.controller('ProfileMessagesController', function ($scope, Authentication) {
		var vm = this;
		vm.user = Authentication.user;
	})
	;
}());
