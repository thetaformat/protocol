import * as __shared from './__shared';
import * as exams from './exams';
import * as manifest from './manifest';
import * as catalog from './catalog';

export const protocol = {
	...__shared,
	...exams,
	...manifest,
	...catalog,
} as typeof __shared & typeof exams & typeof manifest & typeof catalog;
