var _ = require('underscore');

module.exports = function() {

    var elements = {

        tag: function(attrs, content) {

            var attrsString = _.reduce(attrs.attrs, function(memo, val, key) {
                if (key == 'class' && _.isArray(val)) {
                    val = val.join(' ');
                }

                if (val === true) {
                    return memo + ' ' + key; 
                } else {
                    return memo + ' ' + key + '="' + val + '"';
                }            
            }, '');

            return [ 
                ['text', '<' + attrs.name + attrsString + '>'],
                content, 
                ['text', '</' + attrs.name + '>']
            ];
        },

        text: function(attrs, content) {
            return content;
        },

        set: function(attrs, content) {
            _.each(content, function(item, i) {
                if (_.isString(item)) {
                    content[i] = ['text', item];
                }
            });

            return content; 
        },

        doctype: function() {
            return '<!DOCTYPE html>';
        }

    };

    var processors = {
        string: function(str) {
            return str;
        },

        null: function() {
            return '';
        },

        array: function(arr) {
            var result = '';
            _.each(arr, function(item) {
                result += cardigan(item);
            });
            return result;
        },

        block: function(block) {
            var blockName = _.first(block);
            var content = _.rest(block);
            var attrs = _.first(content);

            // Проверить, являются ли атрибуты настоящим объектом
            if (typeof attrs == 'object' && attrs.constructor == Object) {
                content = _.rest(content);
            } else {
                attrs = {};
            }

            var contentLength = _.size(content);
            if (contentLength == 1) {
                content = _.first(content);
            } else if (contentLength == 0) {
                content = null;
            } else {
                content = ['set', content];
            }

            var block = elements[blockName];
            var result;
            if (block) {
                result = block(attrs, content);
            } else {
                result = ['tag', { name: blockName, attrs: attrs }, content];
            }

            return cardigan(result);
        },

        function: function(fn) {
            return cardigan(fn());
        }
    }

    function cardigan(item) {
        // Правила интерпретации
        // Если первый элемент массива — строка, считаем. что это блок
        // Иначе считаем, что это набор элементов

        var type;

        if (_.isArray(item)) {
            var firstElement = _.first(item);
            if (_.isString(firstElement)) {
                type = 'block';
            } else {
                type = 'array';
            }
        } else if (_.isString(item)) {
            type = 'string';
        } else if (_.isFunction(item)) {
            type = 'function';
        } else if (_.isNull(item) || _.isUndefined(item)) {
            type = 'null';
        }

        var processor = processors[type];

        if (!processor) {
            throw 'ParsingError';
        }

        return processor(item);
    }  

    cardigan.addElements = function(newElements) {
        _.extend(elements, newElements);
    }  

    return cardigan;
}



