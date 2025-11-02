export const handleApiError = (error: any, context?: string): string => {
  const contextMsg = context ? `[${context}]` : '[API Error]';
  console.error(contextMsg, error);
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return `Error de conexión: ${error.message}`;
  }
  
  return 'Error inesperado. Intenta nuevamente.';
};

export const logInfo = (message: string, data?: any) => {
  console.log(`[INFO] ${message}`, data || '');
};

export const logError = (message: string, error?: any) => {
  console.error(`[ERROR] ${message}`, error || '');
};