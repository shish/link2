#!/bin/sh
python3 backend/models.py
sqlite3 data/link2.sqlite <<EOF
ATTACH DATABASE 'data/link1.sqlite' AS old;

PRAGMA foreign_keys = ON;

INSERT INTO user (id, username, password, email)
    SELECT id, username, password, COALESCE(email, "")
    FROM old.user;

INSERT INTO friendship (friend_a_id, friend_b_id, confirmed)
    SELECT friend_a_id, friend_b_id, confirmed
    FROM old.friendship;

INSERT INTO survey (id, name, description, long_description, user_id)
    SELECT id, name, description, long_description, user_id
    FROM old.survey;

INSERT INTO question (id, survey_id, "order", section, text, extra)
    SELECT id, survey_id, "order", section, text, extra
    FROM old.question AS old_question
    WHERE old_question.flip_id IS NULL;
INSERT INTO question (id, survey_id, "order", section, text, flip, extra)
    SELECT id, survey_id, "order", section, text, (SELECT text FROM old.question AS oq2 WHERE oq2.id=old_question.flip_id), extra
    FROM old.question AS old_question
    WHERE old_question.flip_id IS NOT NULL AND old_question.id < old_question.flip_id;

INSERT INTO response (id, user_id, survey_id, privacy)
    SELECT id, user_id, survey_id,
        CASE privacy
            WHEN 'public' THEN 'PUBLIC'
            WHEN 'hidden' THEN 'ANONYMOUS'
            WHEN 'private' THEN 'ANONYMOUS'
            WHEN 'friends' THEN 'FRIENDS'
            ELSE NULL 
       END
    FROM old.response;

INSERT INTO answer (response_id, question_id, value, flip)
    SELECT response_id, question_id,
        CASE value
            WHEN 2 THEN 'WANT'
            WHEN 1 THEN 'WILL'
            WHEN 0 THEN 'NA'
            WHEN -1 THEN 'NA'
            WHEN -2 THEN 'WONT'
            ELSE NULL
        END,
        CASE COALESCE(
            (
                SELECT value
                FROM old.answer AS oa2
                WHERE oa2.response_id=old_answer.response_id
                    AND oa2.question_id=(
                        SELECT flip_id
                        FROM old.question AS old_question
                        WHERE old_question.id=old_answer.question_id
                    )
            ),
            0
        )
            WHEN 2 THEN 'WANT'
            WHEN 1 THEN 'WILL'
            WHEN 0 THEN 'NA'
            WHEN -1 THEN 'NA'
            WHEN -2 THEN 'WONT'
            ELSE NULL
        END
    FROM old.answer AS old_answer
    WHERE old_answer.question_id IN (
        SELECT id
        FROM question
    );
EOF
