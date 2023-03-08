import EventSource from 'eventsource';

if (!global.EventSource) {
    global.EventSource = EventSource;
}
