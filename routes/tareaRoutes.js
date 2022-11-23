import express from "express";

import {
  agregarTarea,
  obtenerTareas,
  actualizarTarea,
  eliminarTarea,
  cambiarEstadoTarea,
} from "../controllers/tareaController.js";

import checkAuth from "../middleware/checkAuth.js";
const router = express.Router();

router.post("/", checkAuth, agregarTarea);
router
  .route("/:id")
  .get(checkAuth, obtenerTareas)
  .put(checkAuth, actualizarTarea)
  .delete(checkAuth, eliminarTarea);

router.post("/estado/:id", checkAuth, cambiarEstadoTarea);
export default router;
