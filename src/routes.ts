import { Express, Request, Response } from 'express';
import validate from './middleware.ts/validateResources';
import { createUserSchema } from './schema/user.schema';

import { createSessionSchema } from './schema/session.schema';
import { changePasswordSessionHandler, createUserSessionHandler, deleteSessionHandler, getUserSessionsHandler } from './controller/session.controller';
import requireUser from './middleware.ts/requireUser';
import { createUserHandler, getAllUsers, getUserProfile, resetUserPasswordHandler, updateUserProfile } from './controller/user.controller';

const routes = (app: Express) => {
    app.get('/', (req: Request, res: Response) =>
        res.status(200).send('welcome to nhids'));

    app.get('/healthcheck', (req: Request, res: Response) =>
        res.status(200).send('server up'));

    app.post('/api/v1/users', validate(createUserSchema), createUserHandler);

    app.get('/api/v1/users', getAllUsers);

    app.put('/api/v1/users/:userId/profile', requireUser, updateUserProfile);

    app.get('/api/v1/users/:userId/profile', getUserProfile);

    app.post('/api/v1/users/reset-password', resetUserPasswordHandler);

    app.post('/api/v1/sessions', validate(createSessionSchema), createUserSessionHandler);

    app.get('/api/v1/sessions', requireUser, getUserSessionsHandler);

    app.delete('/api/v1/sessions', requireUser, deleteSessionHandler);

    app.patch(`/api/v1/sessions/change-password`, requireUser, changePasswordSessionHandler);

}

export default routes;