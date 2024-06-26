import { cartsService } from "./repository/carts.service.js";
import { logger } from "../../utils/logger/logger.js";

const getAllCarts = async (req, res) => {
	try {
		logger.info("C: 🔍 Obteniendo todos los carritos");
		const carts = await cartsService.getAll();
		res.status(200).send(carts);
	} catch (error) {
		logger.error("C: 🔴 Error al obtener todos los carritos:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const getCartById = async (req, res) => {
	try {
		logger.info(`C: 🔍 Obteniendo carrito con ID ${req.params.cid}`);
		const cart = await cartsService.getByIdPopulate(req.params.cid);
		if (!cart) {
			res.status(404).send({ error: "Carrito no encontrado" });
			return;
		}
		res.status(200).send(cart);
	} catch (error) {
		logger.error("C: 🔴 Error al obtener el carrito por ID:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const getProductToCart = async (req, res) => {
	try {
		const { cid, pid } = req.params;
		logger.info(
			`C: 🔍 Obteniendo producto con ID ${pid} del carrito con ID ${cid}`
		);
		const product = await cartsService.getProductToCart(cid, pid);
		if (!product) {
			res.status(404).send({ error: "Producto no encontrado en el carrito" });
			return;
		}
		res.status(200).send(product);
	} catch (error) {
		logger.error("C: 🔴 Error al obtener el producto del carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const getPurchaseCart = async (req, res) => {
	try {
		const { cid } = req.params;
		logger.info(`C: 🛒 Realizando compra del carrito con ID ${cid}`);
		const ticket = await cartsService.getPurchaseCart(
			req.rawHeaders[1],
			cid,
			req.infoUser.info.email
		);
		if (!ticket) {
			res.status(400).send({ error: "No se pudo realizar la compra" });
			return;
		}
		logger.info(
			`C: ✔️ Compra del carrito con ID ${cid} realizada correctamente, código de ticket: ${ticket.code}`
		);
		res.status(200).send({
			status: "success",
			message: `, código de ticket: ${ticket.code}`,
		});
	} catch (error) {
		logger.error("C: 🔴 Error al realizar la compra del carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const postCreateCart = async (req, res) => {
	try {
		logger.info("C: ➕ Creando un nuevo carrito");
		const newCart = await cartsService.post(req.body);
		res.status(201).send(newCart);
	} catch (error) {
		logger.error("C: 🔴 Error al crear el carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const postAddProductToCart = async (req, res) => {
	try {
		const { cid, pid } = req.params;
		logger.info(
			`C: ➕ Agregando producto con ID ${pid} al carrito con ID ${cid}`
		);
		if (cid && pid) {
			await cartsService.postAddProductToCart(cid, pid);
			res.status(200).send({ message: "Producto agregado al carrito" });
		} else {
			res
				.status(400)
				.send({ error: "No se pudo agregar el producto al carrito" });
		}
	} catch (error) {
		logger.error("C: 🔴 Error al agregar el producto al carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const putUpdateCart = async (req, res) => {
	try {
		logger.info(`C: 🔄 Actualizando carrito con ID ${req.params.cid}`);
		const updatedCart = await cartsService.put(req.params.cid, req.body);
		if (!updatedCart) {
			res.status(404).send({ error: "Carrito no encontrado" });
			return;
		}
		res.status(200).send(updatedCart);
	} catch (error) {
		logger.error("C: 🔴 Error al actualizar el carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const putUpdateProductInCart = async (req, res) => {
	try {
		const { cid, pid } = req.params;
		logger.info(
			`C: 🔄 Actualizando producto con ID ${pid} en el carrito con ID ${cid}`
		);
		if (cid && pid) {
			await cartsService.putUpdateProductInCart(cid, pid, req.query.action);
			res.status(200).send({ msg: "Producto actualizado en el carrito" });
		} else {
			res
				.status(400)
				.send({ error: "No se pudo actualizar el producto del carrito" });
		}
	} catch (error) {
		logger.error("C: 🔴 Error al actualizar el producto del carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const deleteCart = async (req, res) => {
	try {
		logger.info(`C: 🗑️ Eliminando carrito con ID ${req.params.cid}`);
		if (!req.params.cid) {
			res.status(404).send({ error: "Carrito no encontrado" });
			return;
		}
		await cartsService.delete(req.params.cid);
		res.status(200).send({ message: "Carrito eliminado" });
	} catch (error) {
		logger.error("C: 🔴 Error al eliminar el carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const deleteProductFromCart = async (req, res) => {
	try {
		const { cid, pid } = req.params;
		logger.info(
			`C: 🗑️ Eliminando producto con ID ${pid} del carrito con ID ${cid}`
		);
		if (cid && pid) {
			await cartsService.deleteProductInCart(cid, pid);
			res.status(200).send({ message: "Producto eliminado del carrito" });
		} else {
			res
				.status(400)
				.send({ error: "No se pudo eliminar el producto del carrito" });
		}
	} catch (error) {
		logger.error("C: 🔴 Error al eliminar el producto del carrito:", error);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

export const controllersCarts = {
	getAllCarts,
	getCartById,
	getProductToCart,
	getPurchaseCart,
	postCreateCart,
	postAddProductToCart,
	putUpdateCart,
	putUpdateProductInCart,
	deleteCart,
	deleteProductFromCart,
};
