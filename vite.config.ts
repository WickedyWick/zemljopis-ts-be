import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { Server } from 'socket.io'
import { setupSocketListeners } from './src/lib/server/socket';
export default defineConfig({
	plugins: [sveltekit(),
	{
		name:'sveltekit-socket-io',
		async configureServer(server) {
			//@ts-ignore
			const io: Server = new Server(server.httpServer)
			await setupSocketListeners(io)
		}
	}]
});
