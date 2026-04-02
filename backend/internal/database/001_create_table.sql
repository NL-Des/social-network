-- CHECK à mettre en place
CREATE TABLE IF NOT EXISTS users (
    ID          SERIAL PRIMARY KEY,
    email       TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    firstname   TEXT NOT NULL,
    lastname    TEXT NOT NULL,
    dateofbirth DATE NOT NULL,
    isprivate   BOOLEAN NOT NULL,
    avatar      TEXT,
    pseudo      TEXT UNIQUE,
    aboutme     TEXT
);

-- contrainte à mettre côté app pour éviter les nulls accidentels
-- ON DELETE SET NULL : authorID devient null si le user est supprimé ( anonymisation )
CREATE TABLE IF NOT EXISTS posts (
    ID         SERIAL PRIMARY KEY,
    authorID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    privacy    TEXT NOT NULL,
    createdat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_authorID
    ON posts(authorID);

-- ON DELETE CASCADE : le commentaire est supprimé si le post est supprimé
CREATE TABLE IF NOT EXISTS comments (
    ID         SERIAL PRIMARY KEY,
    postID     INTEGER NOT NULL REFERENCES posts(ID) ON DELETE CASCADE,
    authorID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    createdat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_postID
    ON comments(postID);

CREATE INDEX IF NOT EXISTS idx_comments_authorID
    ON comments(authorID);

CREATE TABLE IF NOT EXISTS messages (
    ID         SERIAL PRIMARY KEY,
    senderID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    receiverID INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    createdat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_senderID
    ON messages(senderID);

CREATE INDEX IF NOT EXISTS idx_messages_receiverID
    ON messages(receiverID);

CREATE TABLE IF NOT EXISTS tag (
    ID   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS post_tag (
    postID INTEGER NOT NULL REFERENCES posts(ID) ON DELETE CASCADE,
    tagID  INTEGER NOT NULL REFERENCES tag(ID) ON DELETE CASCADE,
    PRIMARY KEY (postID, tagID)
);

CREATE TABLE IF NOT EXISTS session (
    ID        SERIAL PRIMARY KEY,
    userID    INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    token     TEXT NOT NULL UNIQUE,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiresat TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_userID
    ON session(userID);

-- côté application : si leaderID devient NULL = choisir un nouveau leader parmi les membres
CREATE TABLE IF NOT EXISTS groups (
    ID          SERIAL PRIMARY KEY,
    creatorID   INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    leaderID    INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    title       TEXT NOT NULL,
    description TEXT,
    createdat   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS group_members (
    groupID   INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    userID    INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    invitedby INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    status    TEXT NOT NULL,
    joinedat  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (groupID, userID)
);

CREATE INDEX IF NOT EXISTS idx_group_members_groupID
    ON group_members(groupID);

CREATE INDEX IF NOT EXISTS idx_group_members_userID
    ON group_members(userID);

CREATE TABLE IF NOT EXISTS group_posts (
    ID        SERIAL PRIMARY KEY,
    groupID   INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    authorID  INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    title     TEXT NOT NULL,
    content   TEXT NOT NULL,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_posts_groupID
    ON group_posts(groupID);

CREATE INDEX IF NOT EXISTS idx_group_posts_authorID
    ON group_posts(authorID);

CREATE TABLE IF NOT EXISTS group_comments (
    ID        SERIAL PRIMARY KEY,
    postID    INTEGER NOT NULL REFERENCES group_posts(ID) ON DELETE CASCADE,
    authorID  INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content   TEXT NOT NULL,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_comments_postID
    ON group_comments(postID);

CREATE INDEX IF NOT EXISTS idx_group_comments_authorID
    ON group_comments(authorID);

CREATE TABLE IF NOT EXISTS group_chats (
    ID        SERIAL PRIMARY KEY,
    groupID   INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    senderID  INTEGER REFERENCES users(ID) ON DELETE SET NULL,
    content   TEXT NOT NULL,
    createdat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updatedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_chats_groupID
    ON group_chats(groupID);

CREATE INDEX IF NOT EXISTS idx_group_chats_senderID
    ON group_chats(senderID);

CREATE TABLE IF NOT EXISTS group_events (
    ID            SERIAL PRIMARY KEY,
    groupID       INTEGER NOT NULL REFERENCES groups(ID) ON DELETE CASCADE,
    creatorID     INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    eventdatetime TIMESTAMPTZ NOT NULL,
    createdat     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_events_groupID
    ON group_events(groupID);

CREATE TABLE IF NOT EXISTS group_event_responses (
    ID          SERIAL PRIMARY KEY,
    eventID     INTEGER NOT NULL REFERENCES group_events(ID) ON DELETE CASCADE,
    userID      INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    response    TEXT NOT NULL,
    respondedat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_group_event_responses_eventID
    ON group_event_responses(eventID);

CREATE INDEX IF NOT EXISTS idx_group_event_responses_userID
    ON group_event_responses(userID);

CREATE TABLE IF NOT EXISTS followers (
    followerID  INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    followingID INTEGER NOT NULL REFERENCES users(ID) ON DELETE CASCADE,
    PRIMARY KEY (followerID, followingID)
);

CREATE INDEX IF NOT EXISTS idx_followers_followerID
    ON followers(followerID);

CREATE INDEX IF NOT EXISTS idx_followers_followingID
    ON followers(followingID);