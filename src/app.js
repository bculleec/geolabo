import path from "node:path";
import dotenv from "dotenv";
import { resolve } from "node:path";

import { fastify } from 'fastify';
import { fastifyView } from '@fastify/view';
import { fastifyRateLimit} from '@fastify/rate-limit';
import { fastifyStatic } from '@fastify/static';
import ejs from 'ejs';

let __dirname = import.meta.dirname;
__dirname = path.join(__dirname, '..');

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: resolve(__dirname, '.env')
    });
}


import { chatRoutes } from "./chatRoutes.js";

const app = fastify({ logger: true });

app.register(fastifyView, { 
    engine: { ejs: ejs },
    root: path.join(__dirname, 'views')
});

app.register(fastifyStatic, {
    root: path.join(__dirname, 'public')
});

await app.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

app.register( chatRoutes );

app.get('/', (_, reply) => {
    return reply.view('index');
});

app.get('/map', (_, reply) => {
    return reply.view('map');
});

app.listen({ port: 4040, host: '0.0.0.0' }, (err, address) => {
    if (err) console.err(err);
});
