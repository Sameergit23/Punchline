"""Desi meme templates, merged ahead of Imgflip's popular list.

IDs come from imgflip.com (the number in a template's URL). box_count is how many
captions the writer fills; templates with their catchphrase already on the image
get one box, which Imgflip places at the top. Entries set to "FILL_ME" are skipped.
"""

DESI_TEMPLATES = [
    {
        "id": "201451348",
        "name": "Babu Bhaiya (Hera Pheri)",
        "box_count": 2,
        "use_when": "fed up with the people around you",
    },
    {
        "id": "423150138",
        "name": "Majnu Bhai's painting (Welcome)",
        "box_count": 2,
        "use_when": "something absurd, or a bizarre combination",
    },
    {
        "id": "266894568",
        "name": "Rasode mein kaun tha",
        "box_count": 2,
        "use_when": "asking who did it; blame",
    },
    {
        "id": "250062045",
        "name": "Jethalal shocked (TMKOC)",
        "box_count": 2,
        "use_when": "sudden panic or disbelief",
    },
    {
        "id": "481561824",
        "name": "Aayein? (confused)",
        "box_count": 2,
        "use_when": "confused by something that makes no sense",
    },
    {
        "id": "446517677",
        "name": "ACP Pradyuman: Kuch toh gadbad hai, Daya (CID)",
        "box_count": 2,
        "use_when": "something is suspicious or doesn't add up",
    },
    {
        "id": "292513022",
        "name": "Daya, darwaza tod do (CID)",
        "box_count": 2,
        "use_when": "brute-forcing a problem; box 1 labels Daya (the one forcing it), box 2 labels the door (the problem)",
    },
    {
        "id": "322157017",
        "name": "Stressed Abhijeet (CID)",
        "box_count": 2,
        "use_when": "overwhelmed; everything going wrong at once",
    },
    {
        "id": "375059752",
        "name": "Bhai kya kar raha hai tu (Shark Tank India)",
        "box_count": 1,
        "use_when": "calling out someone's baffling decision; the image already says 'Bhai kya kar raha hai tu', so the caption is the decision",
    },
    {
        "id": "322978110",
        "name": "Jalwa hai hamara yahan (Mirzapur)",
        "box_count": 1,
        "use_when": "showing off where you rule; the image already says 'Jalwa hai hamara yahan', so the caption sets the scene",
    },
    {
        "id": "324082699",
        "name": "Aap se better ummeed kiye the hum (Mirzapur)",
        "box_count": 1,
        "use_when": "let down by someone you expected more from; the image already says the line, so the caption is what they did",
    },
    {
        "id": "359148935",
        "name": "Abhi maza aayega na bhidu (Phir Hera Pheri)",
        "box_count": 1,
        "use_when": "chaos is about to start and you're excited; the image already says the line, so the caption is the setup",
    },
    {
        "id": "243287128",
        "name": "Bilkul risk nahi lene ka (Hera Pheri)",
        "box_count": 1,
        "use_when": "being extra cautious; the image already says 'Bilkul risks ne lene ka', so the caption is the overcautious move",
    },
]
