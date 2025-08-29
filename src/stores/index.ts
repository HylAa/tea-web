import { createPinia } from "pinia";

const pinia = createPinia();

export default pinia;

// 导出用户 store
export { useUserStore } from './user';
