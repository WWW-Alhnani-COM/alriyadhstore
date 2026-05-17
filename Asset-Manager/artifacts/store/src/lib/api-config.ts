// أنشئ ملف: artifacts/store/src/lib/api-config.ts
import { setBaseUrl } from '../../../../lib/api-client-react/src/custom-fetch';

// تعيين الرابط الأساسي لـ API
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

setBaseUrl(API_BASE_URL);

export { API_BASE_URL };
