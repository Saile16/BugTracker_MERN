// const express = require('express');

// const app = express();

// console.log("tets nodemon")
// app.listen(4000,()=>{
//     console.log('Listening on port 4000');
// })

// habilitamos modules en package.json para poder usar import
// "type": "module" dentro de package.json

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuariosRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";
const app = express();

//para procesar los datos que nos envian desde el front
app.use(express.json());
dotenv.config();

conectarDB();

//Configurar CORS
const whitelist = [process.env.FRONTEND_URL]; // esta es la url de mi front
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      //Puede consultar la API
      callback(null, true);
    } else {
      //No esta permitido el request
      callback(new Error("No permitido por CORS"));
    }
  },
};

app.use(cors(corsOptions));
//Routing
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

const PORT = process.env.PORT || 4000;

const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

//Socket.io
import { Server } from "socket.io";

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Cliente conectado a socket.io");

  //Definir los eventos de socket io
  socket.on("abrir proyecto", (proyectoId) => {
    //esto es como unirlos a una sola sala
    socket.join(proyectoId);
  });

  socket.on("nueva tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    //enviar la tarea a todos los usuarios conectados a ese proyecto
    socket.to(proyecto).emit("tarea agregada", tarea);
  });

  socket.on("eliminar tarea", (tarea) => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit("tarea eliminada", tarea);
  });

  socket.on("actualizar tarea", (tarea) => {
    const proyecto = tarea.proyecto._id;
    console.log(proyecto);
    socket.to(proyecto).emit("tarea actualizada", tarea);
  });

  socket.on("cambiar estado", (tarea) => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit("nuevo estado", tarea);
  });
});
