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
                            '/css/bootstrap.min.css',
                            '/app.css'
                        ],
                        ['charset', 'utf-8'],
                        ['title', 'Lunapark'],
                        ['js', 
                            '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',
                            '/js/bootstrap.min.js',
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
        var classes = ['go'];
        if (attrs.class) {
            classes.push(attrs.class);
        }

        return ['a', { href: url, class: classes }, content];
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
                            action: ['project.show', project.code] 
                        }, 
                        project.name
                    ]
                ];
            }]
        ];
    },

    'page-title': function(attrs, content) {
        return ['h2', content];
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
                ['ul', { class: 'inline' },
                    ['li',
                        ['go', { action: ['ticket.new', attrs.project.code], class: 'btn btn-small' }, 
                            ['i',  { class: 'icon-plus-sign' }], ' ',
                            'Создать тикет'
                        ]
                    ],
                    ['li',
                        ['go', { action: ['ticket.list', attrs.project.code], class: 'btn btn-small' }, 
                            ['i',  { class: 'icon-th-list' }], ' ',
                            'Тикеты'
                        ]
                    ]
                ]
            ]
        ];
    },  

    'ticket-new': function(attrs, content) {
        return [
            ['project-title', { project:  attrs.project }],
            ['legend', 'Новый тикет'],
            ['ticket-form']
        ];
    },

    'ticket-form': function(attrs, content) {
        return (
            ['form', { class: 'ticket-form form-horizontal' },
                ['if', attrs.number,
                    ['div', { class: 'control-group' },
                        ['label', { class: 'control-label' }, 'Тикет'],
                        ['div', { class: 'controls' }, 
                            ['go', 
                                { action: ['ticket.show', attrs.number], class: 'ticket-number' }, 
                                '#', attrs.number
                            ]
                        ]
                    ],
                ],
                ['div', { class: 'control-group' },
                    ['label', { class: 'control-label' }, 'Название'],
                    ['div', { class: 'controls' },
                        ['input', {
                            type: 'text', 
                            class: 'ticket-form-name input-block-level', 
                            placeholder: 'Название',
                            value: attrs.title || ''
                        }],
                    ]
                ],
                ['div', { class: 'control-group' },
                    ['label', { class: 'control-label' }, 'Описание'],
                    ['div', { class: 'controls' },
                        ['textarea', {
                            class: 'ticket-form-description input-block-level', 
                            rows: 12,
                            placeholder: 'Описание'
                        }, attrs.description || '']
                    ]
                ],
                ['div', { class: 'control-group' },
                    ['div', { class: 'controls' },
                        ['button', { class: 'btn btn-success' }, 'Сохранить']
                    ]
                ]
            ]
        )
    },

    'project-title': function(attrs, content) {
        return (
            ['page-title', 
                ['go', { action: ['project.show', attrs.project.code] }, attrs.project.name]
            ]
        );
    },

    'ticket-info': function(attrs, content) {
        return [
            ['project-title', { project: attrs.ticket.project }],
            ['action-panel', 
                ['ul', { class: 'inline' },
                    ['li',
                        ['go', { action: ['ticket.edit', attrs.ticket.number], class: 'btn btn-small' }, 
                            ['i', { class: 'icon-edit' }], ' ',
                            'Редактировать'
                        ]
                    ],
                    ['li',
                        ['button', { class: 'ticket-delete-button btn btn-small' }, 
                            ['i', { class: 'icon-trash' }], ' ',
                            'Удалить'
                        ]
                    ]
                ]
            ],
            ['h3', attrs.ticket.title],
            ['div', attrs.ticket.description]
        ];
    },

    'ticket-edit': function(attrs, content) {
        return [
            ['project-title', { project: attrs.ticket.project }],
            ['ticket-form', attrs.ticket]
        ];
    },

    'ticket-list': function(attrs, content) {
        return [
            ['project-title', { project: attrs.project }],
            ['action-panel',
                ['go', { action: ['ticket.new', attrs.project.code], class: 'btn btn-small' }, 
                    ['i',  { class: 'icon-plus-sign' }], ' ',
                    'Создать тикет'
                ]
            ],
            ['map', attrs.tickets, function(ticket) {
                return ['div', {class: 'ticket-list-item'}, 
                    ['go', 
                        { 
                            action: ['ticket.show', ticket.number] 
                        }, 
                        ticket.title
                    ]
                ];
            }]
        ];
    },
}