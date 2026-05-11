import { Router } from 'express';
import healthCheck from './health-check.js';
import adminInfluencers from './admin-influencers.js';
import payment from './payment.js';

const router = Router();

export default () => {
    router.get('/health', healthCheck);
    router.use('/admin/influencers', adminInfluencers);
    router.use('/payment', payment);

    return router;
};