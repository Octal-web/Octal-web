const fs = require('fs');
const createStatsCard = require('./stats-template');

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

    const newContent = createStatsCard(production, development);
    fs.mkdirSync('assets', { recursive: true });
    fs.writeFileSync('assets/project-stats.svg', newContent);

    let readme = fs.readFileSync('README.md', 'utf8');
    const imgTag = `<img src="./assets/project-stats.svg" alt="Project Stats" width="760"/>`;

    readme = readme.replace(/(<!--PROJECT_STATS_START-->)[\s\S]*(<!--PROJECT_STATS_END-->)/, `$1\n${imgTag}\n$2`);

    fs.writeFileSync('README.md', readme);
})();
