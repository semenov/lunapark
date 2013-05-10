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

    try {
        actions[action.obj][action.method].apply(null, action.params);
    } catch (e) {
        content(['not-found']);
    }   
}

window.onpopstate = function() {
    processUrl(window.location.pathname);
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
            backend('project.get', {code: projectCode}, function(err, project) {
                content(
                    ['ticket-new', { project: project }]
                );

                element('ticket-form').on('submit', function(e) {
                    e.preventDefault();
                    var ticketTitle = element('ticket-form-name').val();
                    var ticketDescription = element('ticket-form-description').val();

                    var ticketParams = {
                        title: ticketTitle,
                        description: ticketDescription,
                        projectCode: projectCode
                    };

                    backend('ticket.create', ticketParams, function(err, ticket) {
                        console.log('ticket', ticket);
                        go('ticket.show', [ticket.number]);
                    });
                });
            });           
        },

        show: function(ticketNumber) {
            backend('ticket.get', { number: ticketNumber }, function(err, ticket) {
                content(
                    ['ticket-info', { ticket: ticket }]
                );

                element('ticket-delete-button').on('click', function(e) {
                    e.preventDefault(); 
                    backend('ticket.delete', { number: ticketNumber }, function(err) {
                        go('ticket.list', [ticket.project.code]);
                    });
                });
            });
        },

        edit: function(ticketNumber) {
            backend('ticket.get', { number: ticketNumber }, function(err, ticket) {
                content(
                    ['ticket-edit', { ticket: ticket }]
                );

                element('ticket-form').on('submit', function(e) {
                    e.preventDefault();
                    var ticketTitle = element('ticket-form-name').val();
                    var ticketDescription = element('ticket-form-description').val();

                    var ticketParams = {
                        number: ticketNumber,
                        title: ticketTitle,
                        description: ticketDescription
                    };

                    backend('ticket.update', ticketParams, function(err, ticket) {
                        go('ticket.show', [ticket.number]);
                    });
                });  
            });            
        },

        list: function(projectCode) {
            backend('project.get', { code: projectCode }, function(err, project) {
                backend('ticket.list', { project: project._id}, function(err, tickets) {
                    content(
                        ['ticket-list', { project: project,  tickets: tickets }]
                    );
                });
            });           
        },
    }
};

$(function() {
});