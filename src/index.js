import Notifications from './Notifications.js'

const NotificationStore = {
    state: [], // here the notifications will be added
    settings: {
        overlap: false,
        initialMargin: 20
    },
    removeNotification (timestamp) {
        const indexToDelete = this.state.findIndex(n => n.timestamp === timestamp)
        if (indexToDelete !== -1) {
            this.state.splice(indexToDelete, 1)
        }
    },
    removeNotificationByObject (obj) {
        const indexToDelete = this.state.indexOf(obj);
        if (indexToDelete !== -1) {
            this.state.splice(indexToDelete, 1)
        }
    },
    removeNotificationByIndex (indexToDelete) {
        if (indexToDelete !== -1) {
            this.state.splice(indexToDelete, 1)
        }
    },
    addNotification(notification){
        notification.timestamp = new Date()
        notification.timestamp.setMilliseconds(notification.timestamp.getMilliseconds() + this.state.length)
        this.state.push(notification);
        return notification;
    },
    notify (notification) {
        if (Array.isArray(notification)) {
            return notification.map((notificationInstance) => {
                return this.addNotification(notificationInstance)
            })
        } else {
            return this.addNotification(notification)
        }

    }
}

var NotificationsPlugin = {
    install (Vue) {
        Vue.mixin({
            data(){
                return {
                    notificationStore: NotificationStore
                }
            },
            methods: {
                notify(notification) {
                    return this.notificationStore.notify(notification);
                }
            }
        })
        Object.defineProperty(Vue.prototype, '$notify', {
            get () {
                return this.$root.notify
            }
        })
        Object.defineProperty(Vue.prototype, '$notifications', {
            get () {
                return this.$root.notificationStore
            }
        })
        Vue.component('Notifications', Notifications)
    }
}

export default NotificationsPlugin
