import express from 'express';
import { generateDynamicPoll } from '../services/ai';

const router = express.Router();

router.get('/generate', async (req, res) => {
    try {
        const question = await generateDynamicPoll();
        res.status(200).json({ question });
    } catch (error) {
        console.error('Error generating poll question:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

export default router;