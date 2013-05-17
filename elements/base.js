var _ = require('underscore');

function realArrayFromSet(set) {
    return _.last(set);
}

module.exports = {
    css: function(attrs, content) {
        var media = attrs.media || 'screen';

        function makeLinkTag(media, url) {
            return ['link', { rel: 'stylesheet', media: media, href: url }] 
        }

        var result;

        if (_.isArray(content) && _.first(content) == 'set') {
            result = _.map(_.last(content), function(url) {
                return makeLinkTag(media, url);
            });

        } else {
            result = makeLinkTag(media, content);
        }

        return result;
    },

    js: function(attrs, content) {
        function makeScriptTag(url) {
            var realAttrs = _.clone(attrs);
            realAttrs.src = url;
            return ['script', realAttrs];
        }

        var result;

        if (_.isArray(content) && _.first(content) == 'set') {
            result = _.map(_.last(content), function(url) {
                return makeScriptTag(url);
            });

        } else {
            result = makeScriptTag(content);
        }

        return result;
    },

    map: function(attrs, content) {
        var arr = realArrayFromSet(content);
        var collection = _.first(arr);
        var iterator = _.last(arr);

        return _.map(collection, iterator);
    },

    if: function(attrs, content) {
        var arr = realArrayFromSet(content);
        var condition = _.first(arr);
        var content = _.rest(arr);
        if (condition) {
            return content;
        }      
    },

    unless: function(attrs, content) {
        var arr = realArrayFromSet(content);
        var condition = _.first(arr);
        var content = _.rest(arr);
        if (!condition) {
            return content;
        }      
    },

    charset: function(attrs, content) {
        return ['meta', { charset: content }];
    },

    description: function(attrs, content) {
        return ['meta', { name: 'description', content: content }];            
    },

    rss: function(attrs, content) {
        var realAttrs = _.clone(attrs);
        realAttrs.rel = 'alternate';
        realAttrs.type = realAttrs.type || 'application/rss+xml';
        realAttrs.href = content;
        
        return ['link', realAttrs];
    }
}