var express = require("express");
var server = express();
var bodyParser = require("body-parser");

server.use(bodyParser.json());

let model = {
  clients: {},
};

model.reset = () => {
  model.clients = {};
};

model.addAppointment = (client, date) => {
  if (!model.clients[client]) {
    model.clients[client] = [];
  }
  model.clients[client].push({ ...date, status: "pending" });
};

model.attend = (name, date) => {
  var matchDate = model.clients[name].find((e) => e.date === date);
  matchDate.status = "attended";
  return matchDate;
};

model.expire = (name, date) => {
  var matchDate = model.clients[name].find((e) => e.date === date);
  matchDate.status = "expired";
  return matchDate;
};

model.cancel = (name, date) => {
  var matchDate = model.clients[name].find((e) => e.date === date);
  matchDate.status = "cancelled";
  return matchDate;
};

model.erase = (name, property) => {
  var letProperty = "date";
  delet = [];
  condition = false;
  if (
    property === "expired" ||
    property === "cancelled" ||
    property === "attended"
  ) {
    letProperty = "status";
  }
  model.clients[name] = model.clients[name].filter((e) => {
    condition = e[letProperty] !== property;
    if (!condition) {
      delet.push(e);
    }
    return condition;
  });
  return delet;
};

model.getAppointments = (name, letStatus) => {
  if (!letStatus) {
    return model.clients[name];
  }
  return model.clients[name].filter((e) => e.status == letStatus);
};

model.getClients = () => {
  return Object.keys(model.clients);
};

server.get("/api", (req, res) => {
  res.status(200);
  res.json(model.clients);
});

server.post("/api/Appointments", (req, res) => {
  const { client, appointment } = req.body;

  if (!client) {
    res.status(400);
    return res.send("the body must have a client property");
  }
  if (typeof client !== "string") {
    res.status(400);
    return res.send("client must be a string");
  }
  model.addAppointment(client, appointment);
  res.status(200);
  return res.json({ ...appointment, status: "pending" });
});

server.get("/api/Appointments/getAppointments/:name", (req, res) => {
  const name = req.params.name;
  const status = req.query.status;
  res.status(200);
  return res.send(model.getAppointments(name, status));
});

server.get("/api/Appointments/clients", (req, res) => {
  res.status(200);
  res.send(model.getClients());
});

server.get("/api/Appointments/:name", (req, res) => {
  const name = req.params.name;
  const { date, option } = req.query;

  if (!model.clients.hasOwnProperty(name)) {
    res.status(400);
    res.send("the client does not exist");
  }

  if (!model.clients[name].find((e) => e.date === date)) {
    res.status(400);
    return res.send("the client does not have a appointment for that date");
  }

  if (!(option === "attend" || option === "expire" || option === "cancel")) {
    res.status(400);
    return res.send("the option must be attend, expire or cancel");
  }

  if (option === "attend") {
    res.status(200);
    return res.send(model.attend(name, date));
  }

  if (option === "expire") {
    res.status(200);
    return res.send(model.expire(name, date));
  }

  if (option === "cancel") {
    res.status(200);
    return res.send(model.cancel(name, date));
  }
});

server.get("/api/Appointments/:name/erase", (req, res) => {
  const name = req.params.name;
  const { date } = req.query;
  if (!model.clients.hasOwnProperty(name)) {
    res.status(400);
    return res.send("the client does not exist");
  }
  res.send(model.erase(name, date));
});

server.listen(3000);
module.exports = { model, server };
