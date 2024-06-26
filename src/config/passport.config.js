import passport from "passport";
import GitHubStrategy from "passport-github2";
import { Strategy as JtwStrategy } from "passport-jwt";
import { usersService } from "../feature/users/repository/users.service.js";
import { logger } from "../utils/logger/logger.js";

export const configPassport = (app, ENV) => {
	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser((user, done) => {
		done(null, user);
	});

	passport.use(
		"jwt",
		new JtwStrategy(
			{
				jwtFromRequest: req => {
					let token = null;
					if (req && req.signedCookies) {
						token = req.signedCookies.jwt;
					}
					return token;
				},
				secretOrKey: ENV.SECRET_COOKIE,
			},
			async function (jwtPayload, done) {
				try {
					const user = await usersService.getById(jwtPayload.id);
					if (user) {
						return done(null, user);
					} else {
						return done(null, { role: "USER", cart: null, username: null });
					}
				} catch (error) {
					logger.warning("⚠️ Error al autenticar con JWT:", error); // Usar el logger para registrar el error
					return done(error, null);
				}
			}
		)
	);

	passport.use(
		"github",
		new GitHubStrategy(
			{
				clientID: ENV.GITHUB.CLIENT_ID,
				clientSecret: ENV.GITHUB.CLIENT_SECRET,
				callbackURL: ENV.GITHUB.CALLBACK_URL,
				scope: "user:email",
			},
			async (accessToken, refreshToken, profile, done) => {
				try {
					const user = await usersService.getByEmail(profile.emails[0].value);
					if (user) {
						done(null, user);
					} else {
						done(null, await usersService.postFromGithub(await profile));
					}
				} catch (error) {
					logger.warning("⚠️ Error al autenticar con GitHub:", error);
					done(error, null);
				}
			}
		)
	);

	app.use(passport.initialize());
};
