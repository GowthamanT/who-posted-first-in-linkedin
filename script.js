function analyzeLinks() {
    const link1 = document.getElementById('link1').value.trim();
    const link2 = document.getElementById('link2').value.trim();
    const errorMsg = document.getElementById('error-msg');
    const resultsSection = document.getElementById('results');

    // Reset previous state
    errorMsg.classList.add('hidden');
    resultsSection.classList.add('hidden');
    resetCards();

    // Validation
    if (!link1 || !link2) {
        showError(
            "Please enter both links. We can't compare a void to a link."
        );
        return;
    }

    try {
        const post1 = processLink(link1);
        const post2 = processLink(link2);

        displayResults(post1, post2);
    } catch (err) {
        showError(
            'Invalid LinkedIn URL format. Make sure they are standard post URLs.'
        );
        console.error(err);
    }
}

function processLink(url) {
    // 1. Extract Post ID (Usually 19 digits)
    const idRegex = /([0-9]{19})/;
    const idMatch = url.match(idRegex);

    if (!idMatch) throw new Error('No ID found');

    const id = idMatch[0];
    const timestamp = getLinkedInDate(id);

    // 2. Extract Username
    // Pattern: posts/username-slug_
    let username = 'Unknown User';
    try {
        // Matches text between 'posts/' and the first underscore '_'
        const nameRegex = /posts\/([^\/]+?)_/;
        const nameMatch = url.match(nameRegex);

        if (nameMatch && nameMatch[1]) {
            username = formatName(nameMatch[1]);
        }
    } catch (e) {
        // Keep default if extraction fails
    }

    return {
        id: id,
        username: username,
        dateObj: timestamp,
        timestamp: timestamp.getTime(),
    };
}

// Logic to get date from LinkedIn ID (First 41 bits = Milliseconds)
function getLinkedInDate(id) {
    // Convert ID to BigInt
    const asBinary = BigInt(id).toString(2);

    // First 41 bits contain the timestamp
    const first41Chars = asBinary.slice(0, 41);

    // Convert back to decimal
    const timestamp = parseInt(first41Chars, 2);

    return new Date(timestamp);
}

function formatName(slug) {
    // Converts "gowthaman-thirunavukkarasu" to "Gowthaman Thirunavukkarasu"
    return slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function displayResults(p1, p2) {
    const results = document.getElementById('results');
    results.classList.remove('hidden');

    // Populate Data
    updateCard('card1', 'user1', 'local1', 'utc1', p1);
    updateCard('card2', 'user2', 'local2', 'utc2', p2);

    // Determine Winner
    const card1 = document.getElementById('card1');
    const card2 = document.getElementById('card2');
    const verdictTitle = document.getElementById('verdict-title');
    const verdictText = document.getElementById('verdict-text');

    // Humorous verdicts
    const funnyInsults = [
        'Ctrl+C, Ctrl+V much?',
        'Originality left the chat.',
        'Caught in 4K.',
        'Imitation is flattery, but this is robbery.',
        "The timeline doesn't lie.",
    ];
    const randomInsult =
        funnyInsults[Math.floor(Math.random() * funnyInsults.length)];

    if (p1.timestamp < p2.timestamp) {
        // P1 is older (Winner)
        card1.classList.add('winner');
        card2.classList.add('loser');
        verdictTitle.innerText = `${p1.username} is the OG.`;
        verdictText.innerText = `${p2.username} was late to the party. ${randomInsult}`;
    } else if (p2.timestamp < p1.timestamp) {
        // P2 is older (Winner)
        card2.classList.add('winner');
        card1.classList.add('loser');
        verdictTitle.innerText = `${p2.username} is the OG.`;
        verdictText.innerText = `${p1.username} was late to the party. ${randomInsult}`;
    } else {
        // Exact same time (Rare)
        verdictTitle.innerText = "It's a Tie?";
        verdictText.innerText =
            'Did they press enter at the exact same millisecond? Sus.';
    }
}

function updateCard(cardId, userId, localId, utcId, data) {
    document.getElementById(userId).innerText = data.username;

    // Format Local Time
    const localOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    document.getElementById(localId).innerText = data.dateObj.toLocaleString(
        undefined,
        localOptions
    );

    // Format UTC Time
    document.getElementById(utcId).innerText = data.dateObj.toUTCString();
}

function resetCards() {
    const cards = document.querySelectorAll('.result-card');
    cards.forEach((c) => {
        c.classList.remove('winner', 'loser');
    });
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.innerText = msg;
    el.classList.remove('hidden');
}
