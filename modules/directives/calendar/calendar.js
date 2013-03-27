/*
 *  AngularJs Fullcalendar Wrapper for the JQuery FullCalendar
 *  API @ http://arshaw.com/fullcalendar/
 *
 *  Angular Calendar Directive that takes in the [eventSources] nested array object as the ng-model and watches (eventSources.length + eventSources[i].length) for changes.
 *       Can also take in multiple event urls as a source object(s) and feed the events per view.
 *       The calendar will watch any eventSource array and update itself when a delta is created
 *       An equalsTracker attrs has been added for use cases that would render the overall length tracker the same even though the events have changed to force updates.
 *
 */
angular.module('ui.directives').directive('uiCalendar', ['ui.config', '$parse', function (uiConfig, $parse) {
  uiConfig.uiCalendar = uiConfig.uiCalendar || {};
  //returns calendar
  return {
    require:'ngModel',
    restrict:'A',
    link:function (scope, elm, attrs, $timeout) {
      var sources = scope.$eval(attrs.ngModel);
      var eventsFingerprint;
      var tracker = 0;
      /* equalsTracker for manual change notifications */
      if (attrs.eventsFingerprint) {
        eventsFingerprint = $parse(attrs.eventsFingerprint)
      } else {
        eventsFingerprint = function () {
          var fpn = [];
          angular.forEach(sources, function (v) {
            if (angular.isArray(v)) {
              for (var i = 0, n = v.length; i < n; i++) {
                var e = v[i];
                fpn.push(e.id, e.title, e.url, e.start, e.end, e.allDay)
              }
            } else {
              fpn.push(v.url)
            }
          });
          return fpn.join("");
        }
      }
      /* update the calendar with the correct options */
      var update = function () {
        //calendar object exposed on scope
        scope.calendar = elm.html('');
        var view = scope.calendar.fullCalendar('getView');
        if (view) {
          view = view.name; //setting the default view to be whatever the current view is. This can be overwritten.
        }
        /* If the calendar has options added then render them */
        var expression,
          options = {
            defaultView:view,
            eventSources:sources,
            eventDrop:function () {
              scope.$apply(attrs.eventChange);
            },
            eventResize:function () {
              scope.$apply(attrs.eventChange);
            }
          };
        if (attrs.uiCalendar) {
          expression = scope.$eval(attrs.uiCalendar);
        } else {
          expression = {};
        }
        angular.extend(options, uiConfig.uiCalendar, expression);
        scope.calendar.fullCalendar(options);
      };
      update();
      /* watches all eventSources */
      scope.$watch(eventsFingerprint, update);
    }
  };
}]);