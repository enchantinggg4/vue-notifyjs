/*!
 * vue-notifyjs v0.1.9
 * (c) 2017-present cristij <joracristi@gmail.com>
 * Released under the MIT License.
 */
'use strict';

var Notification = {
    name: 'notification',
    props: {
        message: null,
        title: String,
        icon: String,
        verticalAlign: {
            type: String,
            default: 'top',
            validator: function validator(value) {
                var acceptedValues = ['top', 'bottom'];
                return acceptedValues.indexOf(value) !== -1;
            }
        },
        horizontalAlign: {
            type: String,
            default: 'center',
            validator: function validator(value) {
                var acceptedValues = ['left', 'center', 'right'];
                return acceptedValues.indexOf(value) !== -1;
            }
        },
        type: {
            type: String,
            default: 'info',
            validator: function validator(value) {
                var acceptedValues = ['info', 'primary', 'danger', 'warning', 'success'];
                return acceptedValues.indexOf(value) !== -1;
            }
        },
        timeout: {
            type: Number,
            default: 5000,
            validator: function validator(value) {
                return value > 0;
            }
        },
        timestamp: {
            type: Date,
            default: function _default() {
                return new Date();
            }
        },
        component: {
            type: [Object, Function]
        }
    },
    data: function data() {
        return {
            elmHeight: 0
        };
    },

    computed: {
        hasIcon: function hasIcon() {
            return this.icon && this.icon.length > 0;
        },
        alertType: function alertType() {
            return 'alert-' + this.type;
        },
        customPosition: function customPosition() {
            var _this = this;

            var initialMargin = this.$notifications.settings["initialMargin"] || 20;
            var alertHeight = this.elmHeight + 10;
            var sameAlertsCount = this.$notifications.state.filter(function (alert) {
                return alert.horizontalAlign === _this.horizontalAlign && alert.verticalAlign === _this.verticalAlign && alert.timestamp <= _this.timestamp;
            }).length;
            if (this.$notifications.settings.overlap) {
                sameAlertsCount = 1;
            }
            var pixels = (sameAlertsCount - 1) * alertHeight + initialMargin;
            var styles = {};
            if (this.verticalAlign === 'top') {
                styles.top = pixels + 'px';
            } else {
                styles.bottom = pixels + 'px';
            }
            return styles;
        }
    },
    methods: {
        close: function close() {
            this.$emit('close', this.timestamp);
        },
        remove: function remove() {
            this.$notifications.removeNotification(this.timestamp);
        }
    },
    mounted: function mounted() {
        this.elmHeight = this.$el.clientHeight;
        if (this.timeout) {
            setTimeout(this.close, this.timeout);
        }
    },
    render: function render(h) {
        if (this.component) return h(
            this.component,
            {
                attrs: { timestamp: this.timestamp, text: this.message, title: this.title }
            },
            []
        );else return h(
            'div',
            {
                on: {
                    'click': this.close
                },
                attrs: {
                    'data-notify': 'container',

                    role: 'alert',

                    'data-notify-position': 'top-center' },
                'class': ['alert open ', { 'alert-with-icon': this.icon }, this.verticalAlign, this.horizontalAlign, this.alertType], style: this.customPosition },
            [h(
                'button',
                {
                    attrs: {
                        type: 'button',
                        'aria-hidden': 'true',

                        'data-notify': 'dismiss'
                    },
                    'class': 'close col-xs-1', on: {
                        'click': this.close
                    }
                },
                ['\xD7']
            ), this.icon && h(
                'span',
                {
                    attrs: { 'data-notify': 'icon' },
                    'class': ['alert-icon', this.icon] },
                []
            ), h(
                'span',
                {
                    attrs: { 'data-notify': 'message' }
                },
                [this.message !== undefined && this.message]
            )]
        );
    }
};

var Notifications = {
    props: {
        transitionName: {
            type: String,
            default: 'list'
        },
        transitionMode: {
            type: String,
            default: 'in-out'
        },
        overlap: {
            type: Boolean,
            default: false
        }
    },
    data: function data() {
        return {
            notifications: this.$notifications.state
        };
    },

    methods: {
        removeNotification: function removeNotification(timestamp) {
            this.$notifications.removeNotification(timestamp);
        }
    },
    created: function created() {
        this.$notifications.settings.overlap = this.overlap;
    },
    render: function render() {
        var _this = this;

        var h = arguments[0];

        var renderedNotifications = this.$notifications.state.map(function (notification, index) {
            return h(
                Notification,
                {
                    attrs: {
                        horizontalAlign: notification.horizontalAlign,
                        verticalAlign: notification.verticalAlign,
                        icon: notification.icon,
                        message: notification.message,
                        timeout: notification.timeout,
                        title: notification.title,
                        type: notification.type,
                        component: notification.component,
                        timestamp: notification.timestamp
                    },
                    key: notification.timestamp.getTime(), on: {
                        'close': _this.removeNotification
                    }
                },
                []
            );
        });
        return h(
            'div',
            { 'class': 'notifications' },
            [h(
                'transition-group',
                {
                    attrs: { name: this.transitionName, mode: this.transitionMode }
                },
                [renderedNotifications]
            )]
        );
    },

    watch: {
        overlap: function overlap(newVal) {
            this.$notifications.settings.overlap = newVal;
        }
    }
};

var NotificationStore = {
    state: [], // here the notifications will be added
    settings: {
        overlap: false,
        initialMargin: 20
    },
    removeNotification: function removeNotification(timestamp) {
        var indexToDelete = this.state.findIndex(function (n) {
            return n.timestamp === timestamp;
        });
        if (indexToDelete !== -1) {
            this.state.splice(indexToDelete, 1);
        }
    },
    removeNotificationByObject: function removeNotificationByObject(obj) {
        var indexToDelete = this.state.indexOf(obj);
        if (indexToDelete !== -1) {
            this.state.splice(indexToDelete, 1);
        }
    },
    removeNotificationByIndex: function removeNotificationByIndex(indexToDelete) {
        if (indexToDelete !== -1) {
            this.state.splice(indexToDelete, 1);
        }
    },
    addNotification: function addNotification(notification) {
        var _this = this;
        notification.timestamp = new Date();
        notification.remove = function () {
            _this.removeNotification(this.timestamp);
        };
        notification.timestamp.setMilliseconds(notification.timestamp.getMilliseconds() + this.state.length);
        this.state.push(notification);
        return notification;
    },
    notify: function notify(notification) {
        var _this2 = this;

        if (Array.isArray(notification)) {
            return notification.map(function (notificationInstance) {
                return _this2.addNotification(notificationInstance);
            });
        } else {
            return this.addNotification(notification);
        }
    }
};

var NotificationsPlugin = {
    install: function install(Vue) {
        Vue.mixin({
            data: function data() {
                return {
                    notificationStore: NotificationStore
                };
            },

            methods: {
                notify: function notify(notification) {
                    return this.notificationStore.notify(notification);
                }
            }
        });
        Object.defineProperty(Vue.prototype, '$notify', {
            get: function get() {
                return this.$root.notify;
            }
        });
        Object.defineProperty(Vue.prototype, '$notifications', {
            get: function get() {
                return this.$root.notificationStore;
            }
        });
        Vue.component('Notifications', Notifications);
    }
};

module.exports = NotificationsPlugin;
