const Fastify = require('fastify');
const accountFunction = require('./api/admin.js');

const app = Fastify();

app.addHook('preHandler', async (req, reply) => {
	req.body = req.body || {};
	req.query = req.query || {};
	req.headers = req.headers || {};
});

app.all('/api/admin', async (req, reply) => {
	return accountFunction(req, {
		status: (code) => {
			reply.status(code);
			return {
				json: (data) => reply.send(data),
				end: () => reply.send(),
			};
		},
		setHeader: (name, value) => reply.header(name, value),
		json: (data) => reply.send(data),
	});
});

app.listen({ port: 3000 }, () => {
	console.log('Fastify server running on http://localhost:3000');
});
