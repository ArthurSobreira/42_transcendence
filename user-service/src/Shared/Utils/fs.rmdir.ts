import * as fs from "node:fs";
import * as path from "node:path";

const distPath = path.resolve(__dirname, '../../../dist');

if (fs.existsSync(distPath))
{
    fs.rm(distPath, { recursive: true }, (err) => {
        if (err)
            console.error('Error while deleting directory ${distPath}', err)
        else
            console.log('Directory ${distPath} deleted successfully')
    });
}
else
    console.log(`Directory ${distPath} does not exists`);