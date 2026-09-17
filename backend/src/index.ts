import { Hono } from 'hono'
import roomRoutes from './routes/room';
import { cors } from 'hono/cors';
import { GameRoom } from './durable-objects/game-room';

const app = new Hono()

app.use(cors());

app.get('/', (c) => {
  return c.json({
    message: "Tic-Tac-Toe backend has started..."
  });
});

app.route('/room', roomRoutes);

export { GameRoom };
export default app
