import { migratePrimers } from "./models/migrate";
import { AutoRouter } from 'itty-router';

const router = AutoRouter();

router.get('/', async (req) => {
	return "Hi from worker";
});

router.get("/migratePrimers/:sub?", migratePrimers);

export default router;
