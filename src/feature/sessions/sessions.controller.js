import { usersService } from "../users/repository/users.service.js";
import { messagesService } from "../messages/repository/messages.service.js";
import { logger } from "../../utils/logger/logger.js";

const register = async (req, res) => {
	try {
		const user = await usersService.postFromLocalRegister(req.body);
		if (user) {
			logger.info("CS: ✅ Usuario registrado correctamente");
			res.status(200).json({ msg: "Usuario registrado correctamente" });
		} else {
			logger.error("CS: 🔴 Error al registrar el usuario");
			res.status(400).json({ msg: "Error al registrar el usuario" });
		}
	} catch (error) {
		logger.error("CS: 🔴 Error al registrar el usuario:", error);
		res.status(500).json({ msg: "Error interno del servidor" });
	}
};

const login = async (req, res) => {
	try {
		const user = await usersService.getLogin(req.body);
		if (user.token && user.cookieOptions) {
			logger.info("CS: 🔑 Usuario logueado correctamente");
			res
				.cookie("jwt", user.token, user.cookieOptions)
				.send({ status: 200, msg: "Usuario logueado correctamente" });
		} else {
			logger.error("CS: 🔴 Error al realizar el inicio de sesión");
			res.status(400).send({ status: 400, msg: user.msg });
		}
	} catch (error) {
		logger.error("CS: 🔴 Error al realizar el inicio de sesión:", error);
		res.status(500).send({ msg: "Error interno del servidor" });
	}
};

const authGitHub = async (req, res) => {};

const authGitHubCallback = async (req, res) => {
	try {
		const user = await usersService.getLoginGithub(req.user);
		res.cookie("jwt", user.token, user.cookieOptions).redirect("/");
	} catch (error) {
		logger.error(
			"CS: 🔴 Error al realizar el callback de autenticación de GitHub:",
			error
		);
		res.status(500).send({ msg: "Error interno del servidor" });
	}
};

const logout = async (req, res) => {
	try {
		req.session.destroy();
		res.clearCookie("jwt");
		logger.info("CS: 🚪 Sesión cerrada correctamente");
		res.status(200).redirect("/");
	} catch (error) {
		logger.error("CS: 🔴 Error al cerrar sesión:", error);
		res.status(500).send({ msg: "Error interno del servidor" });
	}
};

const forgetPassword = async (req, res) => {
	try {
		const result = await usersService.getByEmail(req.params.email);
		if (result) {
			const { datatoken } = await messagesService.postMessageByEmail(
				req.rawHeaders[1],
				result,
				req.params.email
			);
			logger.warning(
				`CS: 🔐 Solicitud de restablecer contraseña correcto usuario ${result._id}`
			);
			res.cookie("token", datatoken.token, datatoken.cookieOptions);
			res.status(200).json({ msg: "Correo enviado correctamente" });
		} else {
			logger.error("CS: 🔴 Error al enviar el correo: Usuario no encontrado");
			res.status(400).json({ msg: "Error al enviar el correo" });
		}
	} catch (error) {
		logger.error("CS: 🔴 Error al enviar el correo:", error);
		res.status(500).json({ msg: "Error interno del servidor" });
	}
};

const resetPassword = async (req, res) => {
	try {
		const result = await usersService.putPasswordByEmail(req.body);
		if (result.msg) {
			logger.warning(`CS: ⚠️ ${result.msg}`);
			res.status(400).json({ msg: result.msg });
		} else {
			messagesService.sendMailPasswordConfirmed(
				req.rawHeaders[1],
				result.email,
				result.username
			);
			logger.info("CS: 🔐 Contraseña actualizada correctamente");
			res.status(200).json({ msg: "Contraseña actualizada correctamente" });
		}
	} catch (error) {
		logger.error("CS: 🔴 Error al restablecer la contraseña:", error);
		res.status(500).json({ msg: "Error interno del servidor" });
	}
};

export const controllersSessions = {
	register,
	login,
	logout,
	authGitHub,
	authGitHubCallback,
	forgetPassword,
	resetPassword,
};
