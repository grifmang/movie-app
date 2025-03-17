import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Load messages for the requested locale
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
