import { messagesService } from "../feature/messages/repository/messages.service.js";
import { productsService } from "../feature/products/repository/products.service.js";
import { ticketsService } from "../feature/tickets/repository/tickets.service.js";
import { usersService } from "../feature/users/repository/users.service.js";
import { logger } from "../utils/logger/logger.js";

const Panel = async (req, res) => {
	try {
		const tickets = await ticketsService.getAll();
		res.render("components/admin/index", {
			layout: "admin",
			admin: {
				title: "Panel",
				tickets,
				...req.infoUser,
			},
		});
		// logger.info("🟢 Panel de administración renderizado con éxito");
	} catch (error) {
		logger.error(
			`🔴 Error al renderizar el panel de administración: ${error.message}`,
			{ stack: error.stack }
		);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const PanelProducts = async (req, res) => {
	try {
		let products;
		const action = req.query.action;
		if (action === "agregar") {
			res.render("components/admin/actionprod", {
				layout: "admin",
				admin: {
					title: "Panel | Agregar",
					data: req.user,
					...req.infoUser,
				},
			});
		} else if (action === "editar") {
			products = await productsService.getById(req.query.pid);
			res.render("components/admin/actionprod", {
				layout: "admin",
				admin: {
					title: "Panel | Editar",
					product: products,
					data: req.user,
					...req.infoUser,
					exist_product: true,
				},
			});
		} else {
			const page = parseInt(req.query.page) || 1;
			products = await productsService.getAll({}, { page, limit: 10 });
			products.prevLink = products.hasPrevPage
				? `/panel/productos?page=${products.prevPage}`
				: "";
			products.nextLink = products.hasNextPage
				? `/panel/productos?page=${products.nextPage}`
				: "";

			res.render("components/admin/products", {
				layout: "admin",
				admin: {
					title: "Panel | Productos",
					products: products.docs.map(product => {
						return {
							...product,
							quantity_photos: product.photo.length,
						};
					}),
					prevLink: products.prevLink,
					nextLink: products.nextLink,
					actualLink: page,
					...req.infoUser,
				},
			});
		}
	} catch (error) {
		logger.error(
			`🔴 Error al renderizar los productos del panel de administración: ${error.message}`,
			{ stack: error.stack }
		);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const PanelMessages = async (req, res) => {
	try {
		const chats = await messagesService.getAll();
		const messages = chats.filter(chat => chat.messages.length > 0);
		res.render("components/admin/chats", {
			layout: "admin",
			admin: {
				title: "Mensajes || Panel",
				...req.infoUser,
				messages,
				chats: messages,
			},
		});
		// logger.info("🟢 Página de mensajes del panel de administración renderizada con éxito");
	} catch (error) {
		logger.error(
			`🔴 Error al renderizar la página de mensajes del panel de administración: ${error.message}`,
			{ stack: error.stack }
		);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const PanelUsers = async (req, res) => {
	try {
		const query = { password: 0, lastConnection: 0, __v: 0 };
		const users = await usersService.getAllCondition(query);
		const usersWithRoleString = users.map(user => {
			return { ...user, roleString: user.role };
		});
		res.render("components/admin/sessions", {
			layout: "admin",
			admin: {
				title: "Panel | Usuarios",
				users: usersWithRoleString,
				...req.infoUser,
			},
		});
	} catch (error) {
		logger.error(
			`🔴 Error al renderizar los usuarios del panel de administración: ${error.message}`,
			{ stack: error.stack }
		);
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const Profile = async (req, res) => {
	try {
		const uid = req.params.uid;
		const datauser = await usersService.getById(uid);
		// console.log(datauser, req.infoUser);
		if (
			datauser.email === req.infoUser.info.email &&
			datauser._id.toString() === req.infoUser.info.id.toString()
		) {
			res.render("components/admin/profile", {
				layout: "admin",
				admin: {
					title: "Perfil",
					...req.infoUser,
					data: datauser,
					role: datauser.role === "CLIENT",
				},
			});
		} else {
			res.status(401).render("404");
		}
		// logger.info("🟢 Carrito renderizado con éxito");
	} catch (error) {
		logger.warning(`🔴 Error al procesar la solicitud: ${error.message}`, {
			stack: error.stack,
		});
		res.status(500).render("404");
	}
};

export const controllersViewAdmin = {
	Panel,
	PanelProducts,
	PanelMessages,
	PanelUsers,
	Profile,
};
