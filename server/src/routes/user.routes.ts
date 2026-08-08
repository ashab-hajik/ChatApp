import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { updateProfileSchema } from '../validations/user.validation';
import { getMe, getUser, searchUsers, updateProfile } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.get('/search', searchUsers);
router.put('/profile', validateBody(updateProfileSchema), updateProfile);
router.get('/:id', getUser);

export default router;
