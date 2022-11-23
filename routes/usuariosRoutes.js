import express from "express";

const router = express.Router();

// import { usuarios, crearUsuario } from "../controllers/usuarioController.js";
import {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} from "../controllers/usuarioController.js";

import checkAuth from "../middleware/checkAuth.js";
// router.get("/", usuarios);
// router.post("/", crearUsuario);

//Autenticación , Registro y Confirmación de Usuarios
router.post("/", registrar); //Crea un nuevo usuario
router.post("/login", autenticar);
router.get("/confirmar/:token", confirmar);
router.post("/olvide-password", olvidePassword);

//en este caso teniamos dos peticiones con el mismo URL pero con diferentes metodos
// router.get("/olvide-password/:token", comprobarToken);
// router.post("/olvide-password/:token", nuevoPassword);
//POR TANTO PODEMOS USAR UNA SOLA RUTA Y DIFERENCIAR LAS PETICIONES CON EL METODO
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

router.get("/perfil", checkAuth, perfil);
export default router;
