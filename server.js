import express from 'express';
import { jsonGraphqlExpress } from 'json-graphql-server/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

// Obtener la ruta del directorio actual
const __dirname = dirname(fileURLToPath(import.meta.url));

// Leer configuración desde config.json
const loadConfig = async () => {
    try {
        const configPath = join(__dirname, 'config.json');
        const configContent = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(configContent);
    } catch (error) {
        console.error('❌ Error al cargar config.json:', error.message);
        process.exit(1); // Salir si no se puede cargar la configuración
    }
};

const config = await loadConfig();
const aplicacion = config.src || 'example'; // Cambia 'default' por el nombre de tu aplicación si es necesario
const PORT = config.port || 3000; // Cambia el puerto si es necesario

// carpeta con los archivos JSON
const DATA_DIR = `data/${aplicacion}`;

const app = express();


const loadData = async () => {
    const dataDir = join(__dirname, DATA_DIR);
    const files = await fs.readdir(dataDir);

    const data = {};
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    await Promise.all(
        jsonFiles.map(async (file) => {
            try {
                console.log(`Cargando archivo: ${file}`);
                const key = file.replace('.json', '');
                const content = await fs.readFile(join(dataDir, file), 'utf-8');
                data[key] = JSON.parse(content); // Parsear el contenido del archivo
            } catch (error) {
                console.error(`❌ Error al procesar el archivo ${file}:`, error.message);
            }
        })
    );

    return data;
};

// Leer el archivo JSON
const data = await loadData();

// Configura el endpoint GraphQL
app.use(`/graphql`, jsonGraphqlExpress(data));
app.listen(PORT, () => {
    console.log(`🚀 Servidor GraphQL corriendo en http://localhost:${PORT}/graphql`);
});