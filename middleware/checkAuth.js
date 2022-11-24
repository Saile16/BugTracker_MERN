import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //de etsa manera obtenemos el token que viene en el header
      token = req.headers.authorization.split(" ")[1];
      //decodificamos el token con los metodos del jwt
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //buscamos al usuario en la base de datos y obtenenemos los datos menos el password
      req.usuario = await Usuario.findById(decoded.id).select(
        "-password -token -confirmado -createdAt -updatedAt -__v"
      );
      //   console.log(req.usuario);
      return next();
    } catch (error) {
      return res.status(404).json({ msg: "There was a mistake" });
    }
  }

  if (!token) {
    const error = new Error("Invalid Token");
    return res.status(400).json({ msg: error.message });
  }
  //funciones de express next para que vaya a la siguiente funcion en este caso
  //perfil
  next();
};

export default checkAuth;
