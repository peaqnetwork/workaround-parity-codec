import feathers from '@feathersjs/feathers';
import '@feathersjs/transport-commons';
import express from '@feathersjs/express';
import EventDecoder from './src/Event';
// import socketio from '@feathersjs/socketio';


// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Express middleware to parse HTTP JSON bodies
app.use(express.json());
// Express middleware to parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Express middleware to to host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
// app.configure(socketio());

// Register our messages service
app.use('/events', new EventDecoder());
// Express middleware with a nicer error handler
app.use(express.errorHandler());

// // Add any new real-time connection to the `events` channel
// app.on('connection', connection =>
//   app.channel('events').join(connection)
// );
// // Publish all events to the `events` channel
// app.publish(data => app.channel('events'));

// Start the server
app.listen(3030).on('listening', () =>
    console.log('Scale codec server listening on 127.0.0.1:3030')
);

