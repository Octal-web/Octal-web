const fs = require('fs');

(async () => {
    const token = process.env.GH_TOKEN;

    const response = await fetch(`https://api.github.com/user/repos?visibility=all`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
        },
    });

    const repos = await response.json();

    let development = 0;
    let production = 0;

    repos.forEach((repo) => {
        const topics = repo.topics || [];

        if (topics.includes('development')) {
            development++;
        }

        if (topics.includes('production')) {
            production++;
        }
    });

    const newContent = `
    <!--PROJECT_STATS_START-->
    🚀 Projetos em produção: ${production}

    👩‍💻 Projetos em desenvolvimento: ${development}
    <!--PROJECT_STATS_END-->
    `;

    let readme = fs.readFileSync('README.md', 'utf8');

    readme = readme.replace(/<!--PROJECT_STATS_START-->[\s\S]*<!--PROJECT_STATS_END-->/, newContent);

    fs.writeFileSync('README.md', readme);
})();
