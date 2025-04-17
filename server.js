import express from 'express';
import { jsonGraphqlExpress } from 'json-graphql-server/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

// Para su funcionamiento deberás crear una carpeta en data/ con los archivos JSON
// y cambiar la variable aplicacion por el nombre de la carpeta
// siempre deberá haber un archivo llamado users.json con los usuarios
const aplicacion = 'example';

const PORT = 3001;
// carpeta con los archivos JSON
const DATA_DIR = `data/${aplicacion}`;

const app = express();

// Obtener la ruta del directorio actual
const __dirname = dirname(fileURLToPath(import.meta.url));

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