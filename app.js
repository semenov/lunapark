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
    console.log(url);
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
                    codename: projectCode
                };

                backend('project.create', project, function(err, result) {
                    go('project.list');
                });
            });        
        }, 

        list: function() {
            backend('project.list', null, function(err, projects) {
                console.log('project.list', projects);
                content(
                    ['project-list', {projects: projects}]
                );
            });
        },

        show: function(codename) {
            backend('project.show', {codename: codename}, function(err, project) {
                console.log('project.show', project);
                content(
                    ['project-info', {project: project}]
                );
            });            
        }
    }
};

$(function() {
    processUrl(window.location.pathname);
});