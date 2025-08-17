import ngrok from 'ngrok';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const port = process.env.NGROK_PORT ? parseInt(process.env.NGROK_PORT) : 8080;
const authtoken = process.env.NGROK_AUTHTOKEN;

if (!authtoken) {
  console.error('Ngrok authtoken is not defined. Please check your .env file.');
  process.exit(1);
}

(async () => {
  try {
    await ngrok.authtoken(authtoken);
    const url = await ngrok.connect({
      addr: `frontend:443`,
      host_header: 'frontend'
    });
    console.log(`Ngrok tunnel established at: ${url}`);
  } catch (error) {
    console.error('Error establishing ngrok tunnel:', error);
    process.exit(1);
  }
})();
