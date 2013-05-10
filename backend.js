var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect('localhost', 'flow');

var Project = mongoose.model('Project', { 
    name: String,
    code: String,
    lastIssueNumber: Number
});

var Ticket = mongoose.model('Ticket', { 
    title: String,
    description: String,
    project: { type: ObjectId, ref: 'Project' },
    number: String,
    created: Date,
    updated: Date
});

module.exports = {
    'project.create': function(params, callback) {
        Project.create(params, callback);
    },

    'project.list': function(params, callback) {
        Project.find(callback);
    },  

    'project.get': function(params, callback) {
        Project.findOne({code: params.code}, callback);
    },

    'ticket.create': function(params, callback) {
        Project.findOneAndUpdate(
            { code: params.projectCode }, 
            { $inc: { lastIssueNumber: 1 } },
            function(err, project) {
                params.number = params.projectCode + '-' + project.lastIssueNumber;
                params.project = project._id;
                params.created = new Date();
                params.updated = params.created;
                Ticket.create(params, callback);
            }
        );
    },   

    'ticket.get': function(params, callback) {
        Ticket.findOne({number: params.number})
            .populate('project')
            .exec(callback);
    },

    'ticket.update': function(params, callback) {
        params.updated = new Date();
        Ticket.findOneAndUpdate({ number: params.number }, params, callback);
    },

    'ticket.list': function(params, callback) {
        Ticket
            .find({ project: params.project })
            .sort('-created')
            .exec(callback);
    }, 

    'ticket.delete': function(params, callback) {
        Ticket.remove({ number: params.number }, callback);
    },
};