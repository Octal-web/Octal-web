const fs = require('fs');
const createStatsCard = require('./stats-template');

(async () => {
    const token = process.env.GH_TOKEN;

    let repos = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await fetch(`https://api.github.com/user/repos?visibility=all&per_page=100&page=${page}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
            },
        });

        const data = await response.json();

        repos = repos.concat(data);

        hasMore = data.length === 100;
        page++;
    }

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
