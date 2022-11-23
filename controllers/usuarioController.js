//pruebas
// const usuarios = (req, res) => {
//   res.json("Desde controles");
// };

// const crearUsuario = (req, res) => {
//   res.json("Desde crearUsuario");
// };
// export { usuarios, crearUsuario };

import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

const registrar = async (req, res) => {
  //Evitar registros duplicados

  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });

  if (existeUsuario) {
    const error = new Error("El usuario ya existe");
    return res.status(400).json({ msg: error.message });
  }

  try {
    const usuario = new Usuario(req.body);
    usuario.token = generarId();

    // const usuarioAlmacenado = await usuario.save();
    await usuario.save();

    //Enviar el email de confirmación
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    // res.json(usuarioAlmacenado);
    res.json({
      msg: "Usuario creado correctamente,revisa tu email para confirmar tu cuenta",
    });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msg: error.message });
  }

  //Comprobar si el usuario está confirmado
  if (!usuario.confirmado) {
    const error = new Error("Tu cuenta no ha sido confirmada");
    return res.status(400).json({ msg: error.message });
  }

  //Comprobar su password , revisar controller schema Usuario
  if (await usuario.comprobarPassword(password)) {
    //recordar estos datos son vistos en el front no en el back no cambian nada en la db
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id),
    });
  } else {
    const error = new Error("El password es incorrecto");
    return res.status(400).json({ msg: error.message });
  }
};

const confirmar = async (req, res) => {
  // console.log(req.params.token);
  //recordar params es para extraer valores de la url
  const { token } = req.params;
  const usuarioConfirmar = await Usuario.findOne({ token });

  if (!usuarioConfirmar) {
    const error = new Error("Token no valido");
    return res.status(403).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario confirmado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  //Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msg: error.message });
  }

  try {
    usuario.token = generarId();
    await usuario.save();

    //Enviar email para recuperar password
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });
    res.json({ msg: "Hemos enviado un email con las instrucciones" });
    console.log(usuario);
  } catch (error) {
    console.log(error);
  }
};

const comprobarToken = async (req, res) => {
  //recordar params es para extraer valores de la url
  const { token } = req.params;

  const tokenValido = await Usuario.findOne({ token });
  if (tokenValido) {
    res.json({ msg: "Token valido y el Usuario existe" });
  } else {
    const error = new Error("Token no valido");
    return res.status(400).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  //comprobar token
  const usuario = await Usuario.findOne({ token });
  if (usuario) {
    usuario.password = password;
    usuario.token = "";
    try {
      await usuario.save();
      res.json({ msg: "Password actualizado correctamente" });
    } catch (error) {
      console.log(error);
    }
    // console.log(usuario);
  } else {
    const error = new Error("Token no valido");
    return res.status(400).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
