var _ = require('underscore');

module.exports = {
    'boilerplate': function(attrs, content) {
        return (
            [
                ['doctype'],
                ['html', {lang: 'ru'},
                    ['head',
                        // Novo Serif google font
                        ['css', 
                            'http://fonts.googleapis.com/css?family=Noto+Serif:400,700,400italic&subset=latin,cyrillic',
                            '/app.css'
                        ],
                        ['charset', 'utf-8'],
                        ['title', 'Flow'],
                        ['js', 
                            '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',
                            '/app.js'
                        ]

                    ],
                    ['body', 
                        ['container',
                            ['page', content]
                        ]
                    ],
                ]
            ]
        );
    },

    'page': function(attrs, content) {
        return [
            // ['header', {class: 'header'},
            //     ['div', {class: 'logo'}, 'Flow']
            // ],
            ['div', { class: 'content' }, content],
            // ['footer',  {class: 'footer'},
            //     '&copy; Flow'
            // ]
        ];
    },

    'container': function(attrs, content) {
        return (
            ['div', { class: 'container' }, content]
        );
    },

    'not-found': function(attrs, content) {
        return [
            ['page-title', 'Не найдено'],
            ['div', 'Запрошенная страница не найдена.']
        ];
    },

    'project-new': function(attrs, content) {
        return [
            ['page-title', 'Новый проект'],
            ['project-form']
        ];
    },

    'go': function(attrs, content) {
        var action = attrs.action;
        var actionPath = _.first(action);
        var params = _.rest(action);
        var parts = actionPath.split('.');
        var obj = _.first(parts);
        var method = _.last(parts);
        var url = ['', obj, method].concat(params).join('/');

        return ['a', { href: url, class: 'go' }, content];
    },

    'action-panel': function(attrs, content) {
        return ['div', { class: 'action-panel'}, content];
    },

    'project-list': function(attrs, content) {
        return [
            ['page-title', 'Проекты'],
            ['action-panel',
                ['go', { action: ['project.new'] }, 'Создать проект'],
            ],
            ['map', attrs.projects, function(project) {
                return ['div', {class: 'project-list-item'}, 
                    ['go', 
                        { 
                            action: ['project.show', project.codename] 
                        }, 
                        project.name
                    ]
                ];
            }]
        ];
    },

    'page-title': function(attrs, content) {
        return ['h1', content];
    },

    'project-form': function(attrs, content) {
        return (
            ['form', { class: 'project-form' },
                ['div',
                    ['input', {
                        type: 'text', 
                        class: 'project-form-name important', 
                        placeholder: 'Название'
                    }],
                ],
                ['div',
                    ['input', {
                        type: 'text', 
                        class: 'project-form-code important', 
                        placeholder: 'Код проекта'
                    }]
                ],
                ['button', 'Сохранить']
            ]
        );
    },

    'project-info': function(attrs, content) {
        return [
            ['page-title', attrs.project.name],
            ['action-panel', 
                ['go', { action: ['ticket.new', attrs.project.codename] }, 'Создать тикет']
            ]
        ];
    },
}