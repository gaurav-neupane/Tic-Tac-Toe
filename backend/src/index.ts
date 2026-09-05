import { Hono } from 'hono'
import roomRoutes from './routes/room';

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    message: "Tic-Tac-Toe backend has started..."
  });
});

app.route('/room', roomRoutes);


export default app
