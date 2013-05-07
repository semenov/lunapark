var mongoose = require('mongoose');
mongoose.connect('localhost', 'flow');

var Project = mongoose.model('Project', { 
    name: String,
    codename: String
});


module.exports = {
    'project.create': function(params, callback) {
        Project.create(params, function(err, project) {
            console.log(project);
            callback(null, params);
        });
    },

    'project.list': function(params, callback) {
        Project.find(function(err, projects) {
            callback(err, projects);
        });
    },  

    'project.show': function(params, callback) {
        Project.findOne({codename: params.codename}, function(err, project) {
            callback(err, project);
        });
    },   
};