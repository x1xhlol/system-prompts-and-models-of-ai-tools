import { fetchAlgoliaResults } from '../search';
import { createRequester } from './createRequester';
export var createAlgoliaRequester = createRequester(fetchAlgoliaResults, 'algolia');