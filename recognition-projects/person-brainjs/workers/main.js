//importScripts();


let operations = {};

function route(operation, data) {
  operations[operation](data);
}

onmessage = function(message) {
  route(message.data.operation, message.data);
};
