export const environment = {
  production: true,

  //AWS
  apiEndPoint: 'https://marketplace.siteworker.com/iconicworker-soa/',
  baseURL: 'https://marketplace.siteworker.com/iconicworker-soa',

  // baseURL: 'http://10.37.57.213:80/iconicworker-soa',
  // apiEndPoint: 'http://10.37.57.213:80/iconicworker-soa/',

  // // QA
  // apiEndPoint: 'http://203.88.135.58:8090/iconicworker-soa/',
  // baseURL: 'http://203.88.135.58:8090/iconicworker-soa',

  // // Tomcat
  // apiEndPoint: 'http://53489188dcf5.ngrok.io/',
  // baseURL: 'http://53489188dcf5.ngrok.io',
  // bellNotificationInterval: 2000 * 60

  // apiEndPoint: 'http://localhost:8080/iconicworker-soa/',
  // baseURL: 'http://localhost:8080/iconicworker-soa',
  bellNotificationInterval: 2000 * 60,
  autoLogout: 7200000, // 2 hours
  autoLogoutimmediate: 43200000, // 12 hours
};
