import express from "express";
import {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
} from "../controllers/proyectoController.js";

import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

//recordar que cuando tenemos dos peticiones con el mismo
// router.get("/", checkAuth, obtenerProyectos);
// router.post("/", checkAuth, nuevoProyecto);
// URL pero con diferentes metodos podemos hacer esto
router
  .route("/")
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto);

router
  .route("/:id")
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

router.post("/colaboradores", checkAuth, buscarColaborador);
router.post("/colaboradores/:id", checkAuth, agregarColaborador);
router.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);
export default router;
