const createFeedback = async (req, res) => {
    try {
        const { rating, comment, userId, animalId, activateId, eventId } = req.body;
        console.log(rating)

        const sql = `
        INSERT INTO feedback (rating, comment, user_id, animal_id, activate_id, event_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
        const values = [rating, comment, userId, animalId, activateId, eventId];
        const [result] = await req.pool.query(sql, values);
        const feedbackId = result.insertId;

        res.status(200).json({ feedbackId });
    } catch (error) {
        console.error('Error creating feedback:', error);
        res.sendStatus(500);
    }
};

const getFeedbackById = async (req, res) => {
    try {
        const { idAnimal, idEvent, idActivity, idUser } = req.params;

        let condition = "";
        let params = [];

        if (idAnimal) {
            condition = "animal_id = ?";
            params.push(idAnimal);
        } else if (idEvent) {
            condition = "event_id = ?";
            params.push(idEvent);
        } else if (idActivity) {
            condition = "activate_id = ?";
            params.push(idActivity);
        } else if (idUser) {
            condition = "user_id = ?";
            params.push(idUser);
        }

        const selectSql = `
        SELECT feedback.id, feedback.rating, feedback.created_at, feedback.comment, feedback.user_id, employer.avatar_url, employer.first_name, employer.name, list_imageRating.url AS image
        FROM feedback
        LEFT JOIN employer ON feedback.user_id = employer.id
        LEFT JOIN list_imageRating ON feedback.id = list_imageRating.feedback_id
        WHERE ${condition}
        ORDER BY feedback.id
      `;

        const [rows] = await req.pool.query(selectSql, params);
        const feedbacks = [];

        let currentFeedback = null;
        for (const row of rows) {
            if (currentFeedback && currentFeedback.id !== row.id) {
                feedbacks.push(currentFeedback);
                currentFeedback = null;
            }

            if (!currentFeedback) {
                currentFeedback = {
                    id: row.id,
                    rating: row.rating,
                    created_at: row.created_at,
                    comment: row.comment,
                    user_id: row.user_id,
                    employer: {
                        avatar_url: row.avatar_url,
                        first_name: row.first_name,
                        name: row.name
                    },
                    images: []
                };
            }

            if (row.image) {
                currentFeedback.images.push(row.image);
            }
        }

        if (currentFeedback) {
            feedbacks.push(currentFeedback);
        }

        const result = { feedback: feedbacks };
        res.json(result);
    } catch (error) {
        console.error('Error retrieving feedback:', error);
        res.sendStatus(500);
    }
};

module.exports = { createFeedback, getFeedbackById };  