import { Messages } from "./messages.schema.js";
import { logger } from "../../utils/logger/logger.js";

export default class MessagesDAO {
	async getAll() {
		try {
			return await Messages.find().lean();
		} catch (error) {
			logger.error("D: 🔴 Error al obtener todos los mensajes:", error);
			throw error;
		}
	}

	async getById(mid) {
		try {
			return await Messages.findById(mid);
		} catch (error) {
			logger.error("D: 🔴 Error al obtener mensaje por id:", error);
			throw error;
		}
	}

	async addMessage(data) {
		try {
			const message = new Messages({ messages: [], user: data });
			return await message.save();
		} catch (error) {
			logger.error("D: 🔴 Error al agregar un mensaje:", error);
			throw error;
		}
	}

	async postMessage(mid, role, message) {
		try {
			const content = { role, message };
			const existChat = await this.getById(mid);
			if (existChat) {
				await Messages.updateOne(
					{ _id: mid },
					{ $push: { messages: content } }
				);
			} else {
				throw new Error("Chat no encontrado");
			}
		} catch (error) {
			logger.error("D: 🔴 Error al agregar un mensaje:", error);
			throw error;
		}
	}

	async getMessages() {
		try {
			return await Messages.find();
		} catch (error) {
			logger.error("D: 🔴 Error al obtener todos los mensajes:", error);
			throw error;
		}
	}

	async delete(mid) {
		try {
			return await Messages.findByIdAndDelete(mid);
		} catch (error) {
			logger.error("D: 🔴 Error al eliminar mensaje por id:", error);
			throw error;
		}
	}

	async deleteClearMessage(mid) {
		try {
			const existChat = await this.getById(mid);
			if (existChat) {
				await Messages.updateOne({ _id: mid }, { $pull: { messages: [] } });
			}
		} catch (error) {
			logger.error("D: 🔴 Error al eliminar un mensaje:", error);
			throw error;
		}
	}
}
