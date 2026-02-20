import { createStore } from 'redux';
import reducer from './reducer';

const store = createStore(reducer);
const persister = 'Free';

export { store, persister };
