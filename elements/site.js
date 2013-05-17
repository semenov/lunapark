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
            ['preloader']
            // ['footer',  {class: 'footer'},
            //     '&copy; Flow'
            // ]
        ];
    },

    'preloader': function() {
        return ['div', { class: 'preloader' },
            ['img', { src: '/preloader.gif' }]
        ];
    },

    'inlternal-preloader': function() {
        return ['div', { class: 'inlternal-preloader' },
            ['img', { src: '/preloader.gif' }]
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
        return ['h2', { class: 'page-title' }, content];
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
        var ticket = attrs.ticket || {};
        return (
            ['form', { class: 'ticket-form form-horizontal' },
                ['if', attrs.ticketNumber,
                    ['div', { class: 'control-group' },
                        ['label', { class: 'control-label' }, 'Тикет'],
                        ['div', { class: 'controls' }, 
                            ['go', 
                                { action: ['ticket.show', attrs.ticketNumber], class: 'ticket-number' }, 
                                '#', attrs.ticketNumber
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
                            value: ticket.title || ''
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
                        }, ticket.description || '']
                    ]
                ],
                ['div', { class: 'control-group' },
                    ['div', { class: 'controls' },
                        ['button', { class: 'btn btn-success ticket-save-button', 'data-loading-text': 'Сохранение...' }, 'Сохранить']
                    ]
                ]
            ]
        )
    },

    'project-title': function(attrs, content) {
        return (
            ['div', { class: 'project-title' },
                ['page-title', function() {
                    if (attrs.project) {
                        return ['go', { action: ['project.show', attrs.project.code] }, attrs.project.name];
                    } else {
                        return '&nbsp;';
                    }
                }]
            ]
        );
    },

    'ticket-info-page': function(attrs, content) {
        return [
            ['project-title', { project: attrs.project }],
            ['action-panel', 
                ['ul', { class: 'inline' },
                    ['li',
                        ['go', { action: ['ticket.edit', attrs.ticketNumber], class: 'btn btn-small' }, 
                            ['i', { class: 'icon-edit' }], ' ',
                            'Редактировать'
                        ]
                    ],
                    ['li',
                        ['button', { class: 'ticket-delete-button btn btn-small', 'data-loading-text': 'Удаление...' }, 
                            ['i', { class: 'icon-trash' }], ' ',
                            'Удалить'
                        ]
                    ]
                ]
            ],
            ['ticket-info', { ticket: attrs.ticket }]
        ];
    },

    'ticket-info': function(attrs) {
        var res;
        if (attrs.ticket) {
            res = [
                ['h3', attrs.ticket.title],
                ['div', attrs.ticket.description]
            ];
        } else {
            res = ['inlternal-preloader'];
        }

        return ['div', { class: 'ticket-info' }, res];
    },

    'ticket-edit': function(attrs, content) {
        return [
            ['project-title', { project: attrs.project }],
            ['legend', 'Редактирование тикета'],
            ['ticket-form', { ticket: attrs.ticket, ticketNumber: attrs.ticketNumber }]
        ];
    },

    'ticket-list-actions': function(attrs) {
        return ['action-panel',
            ['go', { action: ['ticket.new', attrs.projectCode], class: 'btn btn-small' }, 
                ['i',  { class: 'icon-plus-sign' }], ' ',
                'Создать тикет'
            ]
        ];
    },

    'ticket-list': function(attrs) {
        var content;
        if (attrs.loading) {
            content = ['inlternal-preloader'];
        } else {
            content = ['map', attrs.tickets, function(ticket) {
                return ['div', { class: 'ticket-list-item' }, 
                    ['go', 
                        { 
                            action: ['ticket.show', ticket.number] 
                        }, 
                        ticket.title
                    ]
                ];
            }];
        }

        return ['div', { class: 'ticket-list' }, content];
    },

    'ticket-list-page': function(attrs) {
        return [
            ['project-title', { project: attrs.project }],
            ['ticket-list-actions', { projectCode: attrs.projectCode }],
            ['ticket-list', { tickets: attrs.tickets, loading: attrs.loading }]
        ];
    },
}