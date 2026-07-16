-- +migrate Up
ALTER TABLE IF EXISTS groups               RENAME TO social_groups;
ALTER TABLE IF EXISTS group_members        RENAME TO social_group_members;
ALTER TABLE IF EXISTS group_posts          RENAME TO social_group_posts;
ALTER TABLE IF EXISTS group_comments       RENAME TO social_group_comments;
ALTER TABLE IF EXISTS group_events         RENAME TO social_group_events;
ALTER TABLE IF EXISTS group_event_responses RENAME TO social_group_event_responses;
ALTER TABLE IF EXISTS group_post_likes     RENAME TO social_group_post_likes;

-- +migrate Down
ALTER TABLE IF EXISTS social_groups              RENAME TO groups;
ALTER TABLE IF EXISTS social_group_members       RENAME TO group_members;
ALTER TABLE IF EXISTS social_group_posts         RENAME TO group_posts;
ALTER TABLE IF EXISTS social_group_comments      RENAME TO group_comments;
ALTER TABLE IF EXISTS social_group_events        RENAME TO group_events;
ALTER TABLE IF EXISTS social_group_event_responses RENAME TO group_event_responses;
ALTER TABLE IF EXISTS social_group_post_likes    RENAME TO group_post_likes;
