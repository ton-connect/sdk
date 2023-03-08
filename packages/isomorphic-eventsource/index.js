"use strict";

var EventSource = require('eventsource');

if (!global.EventSource) {
    global.EventSource = EventSource;
}
