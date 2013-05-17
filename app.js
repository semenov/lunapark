var cardigan = require('./cardigan');
var _ = require('underscore');
var c = cardigan();
c.addElements(require('./elements/base'));
c.addElements(require('./elements/site'));

function backend(method, params, callback) {
    $.ajax({
        url: '/backend/' + method, 
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(params || {})
    }).done(function(result) {
        callback(null, result);
    }).fail(function() {
        callback(true);
    });
}

function serializeCacheKey(key) {
    var serializedKey;
    if (_.isArray(key)) {
        serializedKey = key.join('.');
    } else {
        serializedKey = key;
    }

    return serializedKey;
}

var cache = {
    set: function(key, val) {
        var serializedKey = serializeCacheKey(key);
        var serializedVal = JSON.stringify(val);
        localStorage[serializedKey] = serializedVal;
    },

    get: function(key) {
        var serializedKey = serializeCacheKey(key);
        var serializedVal = localStorage[serializedKey];
        if (serializedVal !== undefined) {
            return JSON.parse(serializedVal);
        }
    }
};

var stopwatch = function(timerName) {
    var startTime;
    var stopTime;
    var duration;
    return {
        start: function() {
            startTime = new Date();
            console.log(timerName, 'start');
        },

        stop: function() {
            stopTime = new Date();
            duration = stopTime - startTime;
            console.log(timerName, duration);
        }
    };
};

var preloader = {
    show: function() {
        element('preloader').show();
    },

    hide: function() {
        element('preloader').hide();
    }
};

function element(className) {
    return $('.' + className);
}

function content(newContent) {
    element('content').html(c(newContent));
}

$(document).on('click', '.go', function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    processUrl(url); 
    history.pushState(null, null, url);   
});

var defaultAction = 'project.list';

function go(actionPath, params) {
    var historyMethod = 'pushState';
    if (!actionPath) {
        actionPath = defaultAction;
        historyMethod = 'replaceState';
    }
    var parts = actionPath.split('.');
    var obj = _.first(parts);
    var method = _.last(parts);
    params = params || [];
    var url = ['', obj, method].concat(params).join('/');
    history[historyMethod](null, null, url);
    actions[obj][method].apply(null, params);
}

function parseUrl(url) {
    var result = {}
    var urlParts = url.split('/');
    urlParts.shift(); // Removing first empty element
    result.obj = urlParts.shift();
    result.method = urlParts.shift();
    result.params = urlParts;
    return result;
}

function processUrl(url) {
    if (url == '/') {
        go();
        return;
    }

    var action = parseUrl(url);

    if (actions[action.obj] && actions[action.obj][action.method]) {
        actions[action.obj][action.method].apply(null, action.params);
    } else {
        content(['not-found']);
    } 
}

window.onpopstate = function() {
    processUrl(window.location.pathname);
}

function updateProjectTitle(projectCode) {
    backend('project.get', {code: projectCode}, function(err, project) {
        cache.set(['project', projectCode], project);

        element('project-title').replaceWith(c(
            ['project-title', { project: project }]
        ));
    }); 
}

function projectCodeFromTicketNumber(ticketNumber) {
    var parts = ticketNumber.split('-');
    return _.first(parts);
}

var actions = {
    project: {
        new: function() {
            content(
                ['project-new']
            );

            element('project-form').on('submit', function(e) {
                e.preventDefault();
                var projectName = element('project-form-name').val();
                var projectCode = element('project-form-code').val();

                var project = {
                    name: projectName,
                    code: projectCode
                };

                backend('project.create', project, function(err, result) {
                    go('project.list');
                });
            });        
        }, 

        list: function() {
            backend('project.list', null, function(err, projects) {
                content(
                    ['project-list', {projects: projects}]
                );
            });
        },

        show: function(code) {
            backend('project.get', {code: code}, function(err, project) {
                content(
                    ['project-info', {project: project}]
                );
            });            
        }
    },

    ticket: {

        new: function(projectCode) {
            var project = cache.get(['project', projectCode]);

            content(
                ['ticket-new', { project: project }]
            );

            updateProjectTitle(projectCode);

            element('ticket-form').on('submit', function(e) {
                e.preventDefault();
                element('ticket-save-button').button('loading');

                var ticketTitle = element('ticket-form-name').val();
                var ticketDescription = element('ticket-form-description').val();

                var ticketParams = {
                    title: ticketTitle,
                    description: ticketDescription,
                    projectCode: projectCode
                };

                backend('ticket.create', ticketParams, function(err, ticket) {
                    console.log('ticket.create', ticket);
                    cache.set(['ticket', ticket.number], ticket);
                    go('ticket.show', [ticket.number]);
                });
            });

            backend('project.get', {code: projectCode}, function(err, project) {
                cache.set(['project', projectCode], project);

                element('project-title').replaceWith(c(
                    ['project-title', { project: project }]
                ));
            });           
        },

        show: function(ticketNumber) {
            var projectCode = projectCodeFromTicketNumber(ticketNumber);
            var project = cache.get(['project', projectCode]);
            var ticket = cache.get(['ticket', ticketNumber]);
            content(
                ['ticket-info-page', { ticket: ticket, ticketNumber: ticketNumber, project: project }]
            );

            updateProjectTitle(projectCode);

            element('ticket-delete-button').on('click', function(e) {
                e.preventDefault(); 
                element('ticket-delete-button').button('loading');
                backend('ticket.delete', { number: ticketNumber }, function(err) {
                    go('ticket.list', [projectCode]);
                });
            });

            backend('ticket.get', { number: ticketNumber }, function(err, ticket) {
                cache.set(['ticket', ticket.number], ticket);
                element('ticket-info').replaceWith(c(
                    ['ticket-info', { ticket: ticket }]
                ));      

            });
        },

        edit: function(ticketNumber) {
            var projectCode = projectCodeFromTicketNumber(ticketNumber);
            var project = cache.get(['project', projectCode]);
            var ticket = cache.get(['ticket', ticketNumber]);

            content(
                ['ticket-edit', { ticketNumber: ticketNumber, ticket: ticket, project: project }]
            );

            element('ticket-form').on('submit', function(e) {
                e.preventDefault();

                element('ticket-save-button').button('loading');

                var ticketTitle = element('ticket-form-name').val();
                var ticketDescription = element('ticket-form-description').val();

                var ticketParams = {
                    number: ticketNumber,
                    title: ticketTitle,
                    description: ticketDescription
                };

                backend('ticket.update', ticketParams, function(err, ticket) {
                    cache.set(['ticket', ticket.number], ticket);
                    go('ticket.show', [ticket.number]);
                });
            });

            backend('ticket.get', { number: ticketNumber }, function(err, ticket) {
                cache.set(['ticket', ticket.number], ticket);
                element('ticket-form-name').val(ticket.title);
                element('ticket-form-description').val(ticket.description);
            });            
        },

        list: function(projectCode) {
            var project = cache.get(['project', projectCode]);

            backend('ticket.list', { projectCode: projectCode }, function(err, tickets) {
                content(
                    ['ticket-list-page', { project: project, projectCode: projectCode, tickets: tickets }]
                );
                updateProjectTitle(projectCode);

                _.each(tickets, function(ticket) {
                    cache.set(['ticket', ticket.number], ticket);
                });
            });           
        },
    }
};

$(function() {
});